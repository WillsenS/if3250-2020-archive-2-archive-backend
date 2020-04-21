exports.saveModel = (Resource, data) =>
  new Promise(async (resolve, reject) => {
    try {
      const promiseArray = data.map(item => {
        const newItem = new Resource(item);
        return newItem.save();
      });

      const result = await Promise.all(promiseArray);
      resolve(result);
    } catch (e) {
      reject(e);
    }
  });
