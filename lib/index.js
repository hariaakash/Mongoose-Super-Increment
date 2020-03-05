const { Schema } = require('mongoose');

const pluginName = 'MongooseSuperIncrement';
const counterCollectionName = '_Counter';
let Counter;
let CounterSchema;

const initialize = (connection) => {
	try {
		Counter = connection.model(counterCollectionName);
	} catch (err) {
		if (err.name === 'MissingSchemaError') {
			CounterSchema = new Schema({
				model: { type: String, required: true },
				count: { type: Number, default: 0 },
				field: { type: String, default: 'no' },
			});
			Counter = connection.model(counterCollectionName, CounterSchema);
		} else throw err;
	}
};

const parseOptions = (options) => {
	const settings = {
		model: null,
		field: 'no',
		startAt: 0,
		incrementBy: 1,
		prefix: '',
		suffix: '',
	};
	if (typeof options !== 'object') {
		throw new Error(`${pluginName}: require 'options' parameter.`);
	}
	if (options.model) {
		if (typeof options.model === 'string') settings.model = options.model;
		else throw new Error(`${pluginName}: 'options.model' must be of type string.`);
	} else throw new Error(`${pluginName}: 'options.model' name must be set in options.`);
	if (options.field) {
		if (typeof options.field === 'string') {
			if (options.field !== '_id') settings.field = options.field;
			else throw new Error(`${pluginName}: 'options.field' cannot be set as _id`);
		} else throw new Error(`${pluginName}: 'options.field' must be of type string.`);
	}
	if (options.startAt) {
		if (typeof options.startAt === 'number') settings.startAt = options.startAt;
		else throw new Error(`${pluginName}: 'options.startAt' must be of type number.`);
	}
	if (options.incrementBy) {
		if (typeof options.incrementBy === 'number') settings.incrementBy = options.incrementBy;
		else throw new Error(`${pluginName}: 'options.incrementBy' must be of type number.`);
	}
	if (options.prefix) {
		if (['string', 'function'].includes(typeof options.prefix)) {
			settings.prefix = options.prefix;
		} else throw new Error(`${pluginName}: 'options.prefix' must be of type string/function.`);
	}
	if (options.suffix) {
		if (['string', 'function'].includes(typeof options.suffix)) {
			settings.suffix = options.suffix;
		} else throw new Error(`${pluginName}: 'options.suffix' must be of type string/function.`);
	}
	return settings;
};

const initCounter = (settings) => {
	const newCounter = new Counter({
		model: settings.model,
		field: settings.field,
		count: settings.startAt - settings.incrementBy,
	});
	return newCounter.save();
};

const calculateValue = async (settings, resource, count) => {
	const prefix = typeof settings.prefix === 'function'
		? await settings.prefix(resource) : settings.prefix;
	const suffix = typeof settings.suffix === 'function'
		? await settings.suffix(resource) : settings.suffix;
	return (prefix || '') + count + (suffix || '');
};

const nextCount = async (settings, resource, next) => {
	try {
		if (!resource.isNew) next();
		let counter = await Counter.findOne({ model: settings.model, field: settings.field });
		if (!counter) counter = await initCounter(settings);
		counter.count += settings.incrementBy;
		resource[settings.field] = await calculateValue(settings, resource, counter.count);
		counter.save(next);
	} catch (err) {
		console.log(`${pluginName}: Some error occurred`);
		console.log(err);
		next(err);
	}
};

const plugin = (schema, options) => {
	// If we don't have reference to the CounterSchema or the Counter model then the plugin
	// was most likely not initialized properly so throw an error.
	if (!Counter) {
		throw new Error(`${pluginName}: Not been initialized.`);
	}
	const settings = parseOptions(options);

	const fieldSchema = {};
	fieldSchema[settings.field] = { type: String };
	schema.add(fieldSchema);

	schema.pre('save', function preSave(next) {
		nextCount(settings, this, next);
	});
};

module.exports = { initialize, plugin };
