const Document = require('../models/Document');

exports.searchDocument = async (req, res) => {
  let { q, page } = req.query;

  page = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
  q = q || '';

  const limit = 2;
  const options = {
    $text: {
      $search: q
        .split(' ')
        .map(str => `"${str}"`)
        .join(' ')
    }
  };
  const countDocument = await Document.countDocuments(options);
  const findDocument = await Document.find(options)
    .limit(limit)
    .skip((page - 1) * limit);

  const baseLink = `${process.env.BASE_URL}/api/v1/search?q=${q}`;
  const nextLink = countDocument / page > 0 ? `${baseLink}&page=${page + 1}` : null;
  const prevLink = page !== 1 ? `${baseLink}&page=${page - 1}` : null;

  res.json({
    data: findDocument,
    count: countDocument,
    page,
    next_link: nextLink,
    prev_link: prevLink
  });
};
