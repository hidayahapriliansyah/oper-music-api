const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = nanoid(16);

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async checkAlbumExist(albumId) {
    const query = {
      text: `
        SELECT * FROM albums
        WHERE id = $1
      `,
      values: [albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }
  }

  async updateAlbumCover(albumId, imageUrl) {
    const query = {
      text: `
        UPDATE albums SET cover = $1
        WHERE id = $2
        RETURNING id
      `,
      values: [imageUrl, albumId],
    };
    const result = await this._pool.query(query);
    await this._cacheService.delete(`album_with_songs:${albumId}`);

    if (!result.rows.length) {
      throw new InvariantError('Gagal mengubah cover album');
    }
  }

  async getAlbumById(albumId) {
    try {
      const album = await this._cacheService.get(`album_with_songs:${albumId}`);
      const result = {
        album: JSON.parse(album),
        source: 'cache',
      };
      return result;
    } catch (error) {
      const query = {
        text: `
        SELECT 
          albums.*, 
          songs.id AS song_id, 
          songs.title AS song_title, 
          songs.performer AS song_performer
        FROM albums
        LEFT JOIN songs ON albums.id = songs.album_id
        WHERE albums.id = $1
        `,
        values: [albumId],
      };

      const result = await this._pool.query(query);

      if (!result.rows.length) {
        throw new NotFoundError('Album tidak ditemukan');
      }

      const album = {
        id: result.rows[0].id,
        name: result.rows[0].name,
        coverUrl: result.rows[0].cover ?? null,
        year: result.rows[0].year,
        songs: result.rows
          .filter((row) => row.song_id !== null)
          .map((row) => ({
            id: row.song_id,
            title: row.song_title,
            performer: row.song_performer,
          })),
      };

      await this._cacheService.set(`album_with_songs:${albumId}`, JSON.stringify(album));
      return {
        album,
        source: 'db',
      };
    }
  }

  async updateAlbumById({ name, year, albumId }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, albumId],
    };

    const result = await this._pool.query(query);

    await this._cacheService.delete(`album_with_songs:${albumId}`);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(albumId) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }

    await this._cacheService.delete(`album_with_songs:${albumId}`);
    await this._cacheService.delete(`total_album_likes:${albumId}`);
  }

  async _checkUserAlreadyLikedAlbum(userId, albumId) {
    const query = {
      text: `
        SELECT * FROM user_album_likes
        WHERE user_id = $1 AND album_id = $2
      `,
      values: [userId, albumId],
    };
    const result = await this._pool.query(query);
    if (result.rowCount > 0) {
      throw new InvariantError('User sudah menyukai album');
    }
  }

  async _increaseAlbumLikeCount(albumId) {
    const query = {
      text: `
        UPDATE albums
        SET "total_likes" = "total_likes" + 1 
        WHERE id = $1
        RETURNING total_likes
      `,
      values: [albumId],
    };
    const result = await this._pool.query(query);
    if (result.rowCount === 0) {
      throw new InvariantError('Jumlah like tidak berkurang');
    }
    return result.rows[0].total_likes;
  }

  async _decreaseAlbumLikeCount(albumId) {
    const query = {
      text: `
        UPDATE albums
        SET "total_likes" = "total_likes" - 1 
        WHERE id = $1
        RETURNING total_likes
      `,
      values: [albumId],
    };
    const result = await this._pool.query(query);
    if (result.rowCount === 0) {
      throw new InvariantError('Jumlah like tidak berkurang');
    }
    return result.rows[0].total_likes;
  }

  async addLikeToAlbum(userId, albumId) {
    await this.checkAlbumExist(albumId);
    await this._checkUserAlreadyLikedAlbum(userId, albumId);

    const id = `user-album-like${nanoid(16)}`;
    const query = {
      text: `
        INSERT INTO user_album_likes (id, user_id, album_id)
        VALUES ($1, $2, $3)
        RETURNING id
      `,
      values: [id, userId, albumId],
    };
    const result = await this._pool.query(query);
    if (result.rowCount === 0) {
      throw new InvariantError('Gagal menyukai album');
    }
    await this._increaseAlbumLikeCount(albumId);
    await this._cacheService.delete(`total_album_likes:${albumId}`);
  }

  async getTotalAlbumLikes(albumId) {
    try {
      const totalLikes = await this._cacheService.get(`total_album_likes:${albumId}`);
      const result = {
        totalLikes: parseInt(totalLikes, 10),
        source: 'cache',
      };
      return result;
    } catch (error) {
      const query = {
        text: `
          SELECT * FROM albums
          WHERE id = $1
        `,
        values: [albumId],
      };

      const result = await this._pool.query(query);

      if (!result.rows.length) {
        throw new NotFoundError('Album tidak ditemukan');
      }

      const totalLikes = result.rows[0].total_likes;
      await this._cacheService.set(`total_album_likes:${albumId}`, totalLikes);
      return {
        totalLikes,
        source: 'db',
      };
    }
  }

  async deleteLikeFromAlbum(userId, albumId) {
    await this.checkAlbumExist(albumId);

    const query = {
      text: `
        DELETE FROM user_album_likes
        WHERE user_id = $1 AND album_id = $2
        RETURNING id
      `,
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Gagal membatalkan suka. User belum menyukai album');
    }

    await this._decreaseAlbumLikeCount(albumId);
    await this._cacheService.delete(`total_album_likes:${albumId}`);
  }
}

module.exports = AlbumsService;
