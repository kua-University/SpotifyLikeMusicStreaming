const fs = require("fs");

class JsonStoreRepository {
  constructor(filePath) {
    this.filePath = filePath;
  }

  read() {
    return JSON.parse(fs.readFileSync(this.filePath, "utf8"));
  }

  write(store) {
    fs.writeFileSync(this.filePath, JSON.stringify(store, null, 2));
  }

  update(mutator) {
    const store = this.read();
    const result = mutator(store);
    this.write(store);
    return result;
  }
}

module.exports = { JsonStoreRepository };
