# mongoose-super-increment

[![npm version](https://img.shields.io/npm/v/mongoose-super-increment.svg)](https://www.npmjs.com/package/mongoose-super-increment)
[![Dependency Status](https://david-dm.org/hariaakash/mongoose-super-increment.svg)](https://david-dm.org/hariaakash/mongoose-super-increment)
[![devDependency Status](https://david-dm.org/hariaakash/mongoose-super-increment/dev-status.svg)](https://david-dm.org/hariaakash/mongoose-super-increment#info=devDependencies)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/hariaakash/mongoose-super-increment/issues)
[![Downloads](https://img.shields.io/npm/dm/mongoose-super-increment.svg)](https://www.npmjs.com/package/mongoose)
[![Github](https://img.shields.io/github/license/hariaakash/mongoose-super-increment.svg)](https://github.com/hariaakash/Mongoose-Super-Increment/blob/HEAD/LICENSE)

> [Mongoose](http://mongoosejs.com) plugin that auto-increments any ID field on your schema every time a document is saved.

[![NPM](https://nodei.co/npm/mongoose-super-increment.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/mongoose-super-increment)


## Table of Contents

1. [Installation](#installation)
2. [Usage](#usage)
3. [Options](#options)
4. [License](#license)

## Installation

```sh
npm install mongoose-super-increment -S
```

## Usage

Initialize Mongoose Super Increment and add plugin to a schema.

> Note: You only need to initialize Mongoose Super Increment only once.

```js
const mongoose         = require('mongoose');
const mongooseSuperIncrement = require('mongoose-super-increment');

mongooseSuperIncrement.initialize();

const bookSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'Author' },
    title: String,
    genre: String,
    publishDate: Date
});

bookSchema.plugin(mongooseSuperIncrement.plugin, { model: 'Book' });

module.exports = mongoose.model('Book',  bookSchema);
```

That's it. Now you can create book entities at will and they will have an `no` field added of type `String` and will automatically increment with each new document.

### Want a field other than `no`?

````js
bookSchema.plugin(mongooseSuperIncrement.plugin,
{
    model: 'Book',
    field: 'bookId'
});
````

### Want that field to start at a different number than zero or increment by more than one?

````js
bookSchema.plugin(mongooseSuperIncrement.plugin, {
    model: 'Book',
    field: 'bookId',
    startAt: 100,
    incrementBy: 100
});
````

Your first book document would have a `bookId` equal to `100`. Your second book document would have a `bookId` equal to `200`, and so on.

### Want to reset counter back to the start value?

````js
bookSchema.plugin(mongooseSuperIncrement.plugin, {
    model: 'Book',
    field: 'bookId',
    startAt: 100
});

var Book = connection.model('Book', bookSchema),
    book = new Book();

book.save(function (err) {

    // book._id === 100 -> true

    book.nextCount(function(err, count) {

        // count === 101 -> true

        book.resetCount(function(err, nextCount) {

            // nextCount === 100 -> true

        });

    });

});
````

## Options

```js
Model.plugin(MongooseSuperIncrement.plugin, [options]);
```

**Parameters**

* `[options]`           {Object} (required)
    - `model`           {String} Mongoose model name (required)
    - `field`           {String} Mongoose increment field name (optional, default value is `no`)
    - `startAt`         {Number} Mongoose increment field name (optional, default value is 0)
    - `incrementBy`     {Number} Number to increment counter (optional, default value is 1)
    - `prefix`          {String/Function} Counter Prefix (optional, default value is an empty string)
    - `suffix`          {String/Function} Counter Suffix (optional, default value is an empty string)

## License

[MIT](LICENSE)