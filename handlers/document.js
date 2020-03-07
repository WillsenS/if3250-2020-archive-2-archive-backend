/* eslint-disable no-await-in-loop */
const Document = require('../models/Document');
const { translateFiltersMongoose } = require('../helpers');

exports.searchDocument = async (req, res) => {
  try {
    let { q, page } = req.query;
    const { filters } = req.query;
    let options = null;

    q = q || '';
    page = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;

    const limit = 3;
    const searchQuery = {
      $text: {
        $search: q
          .split(' ')
          .map(str => `"${str}"`)
          .join(' ')
      }
    };

    let where = searchQuery;

    if (filters) {
      options = translateFiltersMongoose(filters);
      where = { $and: [where, options] };
    }

    const countDocument = await Document.countDocuments(where);
    const findDocument = await Document.find(where)
      .populate('file')
      .limit(limit)
      .skip((page - 1) * limit);

    let qs = '?';
    const qsNameList = ['q', 'filters'];

    [q, filters].forEach((val, index) => {
      if (qs === '?') {
        if (val) qs += `${qsNameList[index]}=${val}`;
      } else if (val) qs += `&${qsNameList[index]}=${val}`;
    });

    const totalPages = Math.ceil(countDocument / limit);
    const baseLink = `${process.env.BASE_URL}/api/v1/search`;
    const nextLink = totalPages > page ? `${baseLink}${qs}&page=${page + 1}` : '#';
    const prevLink = page > 1 ? `${baseLink}${qs}&page=${page - 1}` : '#';

    const filterAttr = ['lokasi', 'kode'];
    const filtersCandidate = {};

    for (let i = 0; i < filterAttr.length; i += 1) {
      const val = filterAttr[i];
      const findDistictAttribute = await Document.find(where).distinct(val);
      filtersCandidate[val] = findDistictAttribute.sort();
    }

    res.json({
      data: findDocument,
      count: countDocument,
      currentPage: page,
      totalPages,
      filtersCandidate,
      nextLink,
      prevLink
    });
  } catch (err) {
    console.error(err);
  }
};
