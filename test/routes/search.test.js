const request = require('supertest');
const app = require('../../app');

const filterCandidate = ['lokasi', 'kode'];

describe('Search Endpoints without Query', () => {
  it('should create search archive without query', async () => {
    const res = await request(app).get('/api/v1/search');
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
    const res = await request(app).get('/api/v1/search?q=1tb');
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
    const res = await request(app).get('/api/v1/search?q=1tb&filters=lokasi==Bandung');
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