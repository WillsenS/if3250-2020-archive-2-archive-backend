const request = require('supertest');
const app = require('../../app');

jest.setTimeout(10000);

/*
 * SEARCH TEST
 */

const filterCandidate = ['tipe', 'pola', 'lokasi_kegiatan', 'lokasi_simpan_arsip', 'mime'];

describe('Search Endpoints without Query', () => {
  it('should create search archive without query', async () => {
    const res = await request(app).get('/api/v1/archive/search');
    const { data, count, currentPage, totalPages, filtersCandidate, nextLink, prevLink } = res.body;

    expect(res.statusCode).toEqual(200);
    expect(data.length).toEqual(0);
    expect(count).toEqual(0);
    expect(currentPage).toEqual(1);
    expect(totalPages).toEqual(0);
    expect(nextLink).toEqual('#');
    expect(prevLink).toEqual('#');

    filterCandidate.forEach(val => {
      expect(filtersCandidate[val].length >= 0).toEqual(true);
    });
  });
});

let countWithoutFilter = 0;
let countWithFilter = 0;

describe('Search Endpoints with Query', () => {
  it('should create search archive with query', async () => {
    const res = await request(app).get('/api/v1/archive/search?q=itb');
    const { data, count, currentPage, totalPages, filtersCandidate } = res.body;
    countWithoutFilter = count;

    expect(res.statusCode).toEqual(200);
    expect(data.length >= 0).toEqual(true);
    expect(count >= 0).toEqual(true);
    expect(currentPage).toEqual(1);
    expect(totalPages >= 0).toEqual(true);

    filterCandidate.forEach(val => {
      expect(filtersCandidate[val].length >= 0).toEqual(true);
    });
  });
});

describe('Search Endpoints with Query and Filter', () => {
  it('should create search archive with query and filter', async () => {
    const res = await request(app).get('/api/v1/archive/search?q=1tb&filters=pola==PB.03');
    const { data, count, currentPage, totalPages, filtersCandidate } = res.body;
    countWithFilter = count;

    expect(res.statusCode).toEqual(200);
    expect(data.length >= 0).toEqual(true);
    expect(count >= 0).toEqual(true);
    expect(currentPage).toEqual(1);
    expect(totalPages >= 0).toEqual(true);
    expect(countWithFilter <= countWithoutFilter).toEqual(true);

    filterCandidate.forEach(val => {
      expect(filtersCandidate[val].length >= 0).toEqual(true);
    });
  });
});

/*
 * ARCHIVE TEST
 */

describe('Upload archive without login and without data', () => {
  it('should return error response with status 400', async () => {
    const res = await request(app).post('/api/v1/archive/upload');

    expect(res.statusCode).toEqual(400);
  });
});

describe('Edit archive with invalid id and without login', () => {
  it('should return error response with status 400', async () => {
    const res = await request(app).patch('/api/v1/archive/edit/abcd');

    expect(res.statusCode).toEqual(400);
  });
});

describe('Delete archive with invalid id and without login', () => {
  it('should return error response with status 400', async () => {
    const res = await request(app).delete('/api/v1/archive/delete/abcd');

    expect(res.statusCode).toEqual(400);
  });
});
