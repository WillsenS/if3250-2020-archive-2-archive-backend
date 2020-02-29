const Document = require('../models/Document');
const { translateFiltersMongoose } = require('../helpers');

exports.searchDocument = async (req, res) => {
  let { q, page, filters } = req.query;

  q = q || '';
  page = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;

  const limit = 5;
  let where = {
    $text: {
      $search: q
        .split(' ')
        .map(str => `"${str}"`)
        .join(' ')
    }
  };

  if (filters) {
    options = translateFiltersMongoose(filters);
    where = { $and: [where, options] };
  }

  const countDocument = await Document.countDocuments(where);
  const findDocument = await Document.find(where)
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

  const filterAttr = ['lokasi'];
  const filtersCandidate = [];
  filterAttr.forEach(val => {
    let arr = [];

    findDocument.forEach(doc => {
      if (!arr.includes(doc[val])) arr.push(doc[val]);
    });

    const obj = {};
    obj[val] = arr;
    filtersCandidate.push(obj);
  });

  res.json({
    data: findDocument,
    count: countDocument,
    page,
    filtersCandidate,
    nextLink: nextLink,
    prevLink: prevLink
  });
};
