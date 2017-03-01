function copldotsCloneContractedPropertiesLayer(properties, opts) {
  return {
    type: 'object',
    properties: copldotsClonePotentiallyCondensedProperties(properties, opts),
    minimumProperties: 1
  };
}

function copldotsClonePotentiallyCondensedProperties(source, opts) {
  var clone = {};
  var keys = Object.keys(source);
  var n = keys.length;
  for (var i = 0; i < n; ++i) {
    var key = keys[i];
    if (key.slice(-1) == '.') {
      clone[key.slice(0,-1)] =
        copldotsCloneContractedPropertiesLayer(source[key], opts);
    } else {
      clone[key] = copldotsCloneSchemaObject(source[key], opts);
    }
  }
  return clone;
}

function copldotsCloneSchemaProperties(source, opts) {
  var clone = {};
  var keys = Object.keys(source);
  var n = keys.length;
  for (var i = 0; i < n; ++i) {
    var key = keys[i];
    clone[key] = copldotsCloneSchemaObject(source[key], opts);
  }
  return clone;
}

function copldotsCloneSchemaOrStringArrayProperties(source, opts) {
  var clone = {};
  var keys = Object.keys(source);
  var n = keys.length;
  var cloneArray = opts.cloneArray;
  for (var i = 0; i < n; ++i) {
    var key = keys[i];
    if (Array.isArray(source[key])) {
      clone[key] = cloneArray(source[key]);
    } else {
      clone[key] = copldotsCloneSchemaObject(source[key], opts);
    }
  }
  return clone;
}

function copldotsCloneSchemaObject(source, opts) {
  var clone = {};
  var keys = Object.keys(source);
  var n = keys.length;
  var cloneArray = opts.cloneArray;
  var cloneOther = opts.cloneOther;
  var cloneAdditionalProperties = opts.cloneAdditionalProperties;
  for (var i = 0; i < n; ++i) {
    var key = keys[i];
    switch (key) {

      case 'items':
        if (Array.isArray(source[key])) {
          clone[key] = copldotsCloneSchemaArray(source[key], opts);
        } else {
          clone[key] = copldotsCloneSchemaObject(source[key], opts);
        } break;

      case 'allOf':
      case 'anyOf':
      case 'oneOf':
        clone[key] = copldotsCloneSchemaArray(source[key], opts);
        break;

      case 'not':
        clone[key] = copldotsCloneSchemaObject(source[key], opts);
        break;

      case 'additionalItems':
      case 'additionalProperties':
        if (typeof source[key] == 'boolean') {
          clone[key] = source[key]; // boolean clone
        } else {
          clone[key] = copldotsCloneSchemaObject(source[key], opts);
        } break;

      case 'definitions':
      case 'patternProperties':
        clone[key] = copldotsCloneSchemaProperties(source[key], opts);
        break;

      case 'properties':
        clone[key] =
          copldotsClonePotentiallyCondensedProperties(source[key], opts);
        break;

      case 'dependencies':
        clone[key] =
          copldotsCloneSchemaOrStringArrayProperties(source[key], opts);
        break;

      case 'type':
        if (Array.isArray(source[key])) {
          clone[key] = cloneArray(source[key]);
        } else {
          clone[key] = source[key]; // string clone
        } break;

      // array of anything
      case 'enum':
      // string array
      case 'required':
        clone[key] = cloneArray(source[key]);
        break;

      // translate schema appropriately
      case '$schema':
        if (source[key] == "https://schemata.opws.org/meta/copld.json#") {
          clone[key] = "http://json-schema.org/draft-04/schema#";
        } else {
          clone[key] = source[key]; // string clone
        } break;

      // other strings
      case 'id':
      case 'title':
      case 'description':
      // formatted strings
      case 'pattern':
      // numbers
      case 'multipleOf':
      case 'maximum':
      case 'minimum':
      // fancy numbers
      case 'maxLength':
      case 'minLength':
      case 'maxItems':
      case 'minItems':
      case 'maxProperties':
      case 'minProperties':
      // booleans
      case 'exclusiveMaximum':
      case 'exclusiveMinimum':
      case 'uniqueItems':
        clone[key] = source[key];
        break;

      // anything
      case 'default':
        clone[key] = cloneOther(source[key], key);
        break;

      // any out-of-scope property
      default:
        clone[key] = cloneAdditionalProperties(source[key], key);
        break;
    }
  }
  return clone;
}

function copldotsCloneSchemaArray(source, opts) {
  return source.map(function(obj){copldotsCloneSchemaObject(obj, opts)});
}

module.exports = function copldots(copld, opts) {
  opts = opts || {};
  opts.cloneOther = opts.cloneOther || function identity(x){return x};
  opts.cloneArray = opts.cloneArray || opts.cloneOther;
  opts.cloneAdditionalProperties =
    opts.cloneAdditionalProperties || opts.cloneOther;
  return copldotsCloneSchemaObject(copld, opts);
};
