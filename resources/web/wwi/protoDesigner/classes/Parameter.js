'use strict';

import {VRML, vrmlTypeAsString} from './utility/utility.js';

import WbVector2 from '../../nodes/utils/WbVector2.js';
import WbVector3 from '../../nodes/utils/WbVector3.js';
import WbVector4 from '../../nodes/utils/WbVector4.js';

import {FieldModel} from './FieldModel.js';
import {ProtoModel} from './ProtoModel.js';

import Proto from './Proto.js';

export default class Parameter {
  constructor(protoRef, id, name, type, isRegenerator, defaultValue, value) {
    this.protoRef = protoRef; // proto this parameter belongs to
    this.id = id;
    this.name = name; // name as defined in the proto header (i.e value after an IS)
    this.type = type;
    this.isTemplateRegenerator = isRegenerator;
    //note: parameter values are encoded in a JS-friendly syntax so that template statements can reference it directly
    this.defaultValue = defaultValue;
    this.value = value;
    this.xml = document.implementation.createDocument('', '', null);
  }

  isSFNode() {
    return this.type === VRML.SFNode;
  }

  exportVrmlHeader() {
    return 'field ' + vrmlTypeAsString(this.type) + ' ' + this.name + ' ' + this.vrmlify() + '\n';
  }

  isDefaultValue() {
    switch (this.type) {
      case VRML.SFBool:
      case VRML.SFFloat:
      case VRML.SFInt32:
      case VRML.SFString:
      case VRML.SFVec2f:
      case VRML.SFVec3f:
      case VRML.SFColor:
      case VRML.SFRotation:
      case VRML.SFNode:
        return this.#deepEqual(this.value, this.defaultValue)
      case VRML.MFBool:
      case VRML.MFFloat:
      case VRML.MFInt32:
      case VRML.MFString:
        if (this.value.length !== this.defaultValue.length)
          return false;
        for (let i = 0; i < this.value.length; ++i) {
          if (this.value.valueOf() !== this.defaultValue.valueOf())
            return false;
        }
        return true;
      case VRML.MFVec2f:
      case VRML.MFVec3f:
      case VRML.MFColor:
      case VRML.MFRotation:
      case VRML.MFNode:
        // TODO: what if order is not the same?
        if (this.value.length !== this.defaultValue.length)
          return false;
        for (let i = 0; i < this.value.length; ++i) {
          if (!this.#deepEqual(this.value[i], this.defaultValue[i]))
            return false;
        }
        return true;
      default:
        throw new Error('Cannot determine if parameter value was change, unknown type ' + this.type);
    }
  }

  #deepEqual(x, y) {
    if (x === y)
      return true;
    else if ((typeof x === 'object' && x != null) && (typeof y === 'object' && y != null)) {
      if (Object.keys(x).length != Object.keys(y).length)
        return false;

      for (let property in x) {
        if (y.hasOwnProperty(property)) {
          if (!this.#deepEqual(x[property], y[property]))
            return false;
        }
        else
          return false;
      }

      return true;
    }

    return false;
  }

  setValueFromString(value) {
    switch (this.type) {
      case VRML.SFBool:
        this.value = value === 'true';
        break;
      case VRML.SFFloat:
        this.value = parseFloat(value);
        break;
      case VRML.SFInt32:
        this.value = parseInt(value);
        break;
      case VRML.SFString:
        this.value = value;
        break;
      case VRML.SFVec2f:
        const v2 = value.split(/\s/);
        this.value = new WbVector2(parseFloat(v2[0]), parseFloat(v2[1]));
        break;
      case VRML.SFVec3f:
      case VRML.SFColor:
        const v3 = value.split(/\s/);
        this.value = new WbVector3(parseFloat(v3[0]), parseFloat(v3[1]), parseFloat(v3[2]));
        break;
      case VRML.SFRotation:
        const v4 = value.split(/\s/);
        this.value = new WbVector4(parseFloat(v4[0]), parseFloat(v4[1]), parseFloat(v4[2]), parseFloat(v4[3]));
        break;
      case VRML.SFNode:
        console.error('Attempting to set SFNode from string, but not yet implemented.');
        break;
      case VRML.MFString:
        this.value = value.split(' ');
        break;
      default:
        throw new Error('Unknown type \'' + this.type + '\' in setValueFromString.');
    }
  }

  vrmlify() {
    // TODO: update
    /*
    switch (this.type) {
      case VRML.SFBool:
        return this.value.toString().toUpperCase();
      case VRML.SFFloat:
      case VRML.SFInt32:
        return this.value.toString();
      case VRML.SFString:
        return this.value;
      case VRML.SFVec2f:
        return this.value.x + ' ' + this.value.y;
      case VRML.SFVec3f:
      case VRML.SFColor:
        return this.value.x + ' ' + this.value.y + ' ' + this.value.z;
      case VRML.SFRotation:
        return this.value.x + ' ' + this.value.y + ' ' + this.value.z + ' ' + this.value.w;
      case VRML.SFNode:
        if (typeof this.value === 'undefined')
          return 'NULL';
        else
          console.warning('Pre-defined SFNodes should not be exported using vrmlify.');
        break;
      case VRML.MFBool:
        let mfb = '[';
        for (let i = 0; i < this.value.length; ++i)
          mfb += this.value[i].toString().toUpperCase() + ', ';
        if (mfb.length > 1)
          mfb = mfb.slice(0, -2);
        return mfb + ']';
      case VRML.MFInt32:
      case VRML.MFString:
        let mfs = '[';
        for (let i = 0; i < this.value.length; ++i)
          mfs += this.value[i] + ', ';
        if (mfs.length > 1)
          mfs = mfs.slice(0, -2);
        return mfs + ']';
      case VRML.MFNode:
        if (this.value.length === 0)
          return '[]';
        else
          console.warn('Pre-defined MFNodes should not be exported using vrmlify.');
        break;
      default:
        throw new Error('Unknown type \'' + this.type + '\' in vrmlify.');
    }
    */
  }

  x3dify() {
    switch (this.type) {
      case VRML.SFBool:
      case VRML.SFFloat:
      case VRML.SFInt32:
      case VRML.SFString:
        return this.value;
      case VRML.SFVec2f:
        return this.value.x + ' ' + this.value.y;
      case VRML.SFVec3f:
      case VRML.SFColor:
        return this.value.x + ' ' + this.value.y + ' ' + this.value.z;
      case VRML.SFRotation:
        return this.value.x + ' ' + this.value.y + ' ' + this.value.z + ' ' + this.value.w;
      case VRML.SFNode:
        if (typeof this.value === 'undefined')
          return;
        return this.encodeNodeAsX3d(this.value, this.value.nextToken().word());
      case VRML.MFString:
      case VRML.MFInt32:
      case VRML.MFFloat:
      case VRML.MFNode:
        if (!Array.isArray(this.value))
          console.error('Expected an array, but value is not. Is it normal?');
        let s = '';
        for (let i = 0; i < this.value.length; ++i)
          s += this.value[i] + ' ';
        s = s.slice(0, -1);
        return s;
      default:
        throw new Error('Unknown type \'' + this.type + '\' in x3dify.');
    }
  }

  encodeNodeAsX3d(tokenizer, nodeName, parentElement) {
    let nodeElement = this.xml.createElement(nodeName);
    if (nodeName === 'ImageTexture') {
      let role;
      switch (this.role) {
        case 'baseColorMap':
          role = 'baseColor';
          break;
        case 'metalnessMap':
          role = 'metalness';
          break;
        case 'roughnessMap':
          role = 'roughness';
          break;
        case 'normalMap':
          role = 'normal';
          break;
        case 'occlusionMap':
          role = 'occlusion';
          break;
        case 'emissiveColorMap':
          role = 'emissiveColor';
          break;
      }
      if (typeof role !== 'undefined')
        nodeElement.setAttribute('role', role);
    }
    tokenizer.skipToken('{'); // skip opening bracket following node token

    let ctr = 1; // bracket counter
    while (ctr !== 0) {
      const word = tokenizer.nextWord();
      if (word === '{' || word === '}') {
        ctr = word === '{' ? ++ctr : --ctr;
        continue;
      }

      this.encodeFieldAsX3d(tokenizer, nodeName, word, nodeElement);
    };

    if (parentElement)
      parentElement.appendChild(nodeElement);

    return nodeElement;
  }

  encodeFieldAsX3d(tokenizer, nodeName, fieldName, nodeElement) {
    // determine if the field is a VRML node of if it should be consumed
    const fieldType = FieldModel[nodeName]['supported'][fieldName];
    if (typeof fieldType === 'undefined') {
      const fieldType = FieldModel[nodeName]['unsupported'][fieldName]; // check if it's one of the unsupported ones instead
      if (typeof fieldType !== 'undefined') {
        tokenizer.consumeTokensByType(fieldType);
        return;
      } else
        throw new Error('Cannot encode field \'' + fieldName + '\' as x3d because it is not part of the FieldModel of node \'' + nodeName + '\'.');
    }

    if (typeof nodeElement === 'undefined')
      throw new Error('Cannot assign field to node because \'nodeElement\' is not defined.');
    if (fieldType === VRML.SFNode) {
      let imageTextureType;
      if (tokenizer.peekWord() === 'ImageTexture')
        imageTextureType = tokenizer.recallWord(); // remember the type: baseColorMap, roughnessMap, etc

      this.encodeNodeAsX3d(tokenizer, tokenizer.nextWord(), nodeElement);
      // exceptions to the rule. TODO: find a better solution (on webots side)
      if (typeof imageTextureType !== 'undefined') {
        const imageTextureElement = nodeElement.lastChild;
        if (imageTextureType === 'baseColorMap')
          imageTextureElement.setAttribute('role', 'baseColor');
        else if (imageTextureType === 'roughnessMap')
          imageTextureElement.setAttribute('role', 'roughness');
        else if (imageTextureType === 'metalnessMap')
          imageTextureElement.setAttribute('role', 'metalness');
        else if (imageTextureType === 'normalMap')
          imageTextureElement.setAttribute('role', 'normal');
        else if (imageTextureType === 'occlusionMap')
          imageTextureElement.setAttribute('role', 'occlusion');
        else if (imageTextureType === 'emissiveColorMap')
          imageTextureElement.setAttribute('role', 'emissiveColor');
      }
    } else {
      const stringifiedValue = this.stringifyTokenizedValuesByType(tokenizer, fieldType);
      nodeElement.setAttribute(fieldName, stringifiedValue);
    }
  }

  stringifyTokenizedValuesByType(tokenizer, type) {
    let value = '';

    switch (type) {
      case VRML.SFBool:
        value += tokenizer.nextWord() === 'TRUE' ? 'true' : 'false';
        break;
      case VRML.SFString:
      case VRML.SFFloat:
      case VRML.SFInt32:
        value += tokenizer.nextWord();
        break;
      case VRML.SFVec2f:
        value += tokenizer.nextWord() + ' ';
        value += tokenizer.nextWord();
        break;
      case VRML.SFVec3f:
      case VRML.SFColor:
        value += tokenizer.nextWord() + ' ';
        value += tokenizer.nextWord() + ' ';
        value += tokenizer.nextWord();
        break;
      case VRML.SFRotation:
        value += tokenizer.nextWord() + ' ';
        value += tokenizer.nextWord() + ' ';
        value += tokenizer.nextWord() + ' ';
        value += tokenizer.nextWord();
        break;
      case VRML.MFString:
        if (tokenizer.peekWord() !== '[')
          value = tokenizer.nextWord(); // field is MFString, but only 1 element is given
        else {
          tokenizer.skipToken('[');
          while (tokenizer.peekWord() !== ']')
            value += tokenizer.nextWord() + ' ';
          value = value.slice(0, -1);
          tokenizer.skipToken(']');
        }
        break;
      case VRML.MFFloat:
      case VRML.MFInt32:
        while (tokenizer.peekWord() !== ']')
          value += tokenizer.nextWord() + ' ';
        value = value.slice(0, -1);
        break;
      case VRML.MFVec2f: {
        let ctr = 1;
        while (tokenizer.peekWord() !== ']') {
          value += tokenizer.nextWord();
          value += (!(ctr % 2) ? ', ' : ' ');
          ctr = ctr > 1 ? 1 : ++ctr;
        }
        value = value.slice(0, -2);
        break;
      }
      case VRML.MFColor:
      case VRML.MFVec3f: {
        let ctr = 1;
        if (tokenizer.peekWord() === '[')
          tokenizer.skipToken('[');

        while (tokenizer.peekWord() !== ']') {
          value += tokenizer.nextWord();
          value += (!(ctr % 3) ? ', ' : ' ');
          ctr = ctr > 2 ? 1 : ++ctr;
        }
        value = value.slice(0, -2);
        tokenizer.nextWord();
        break;
      }
      default:
        throw new Error('Field type \'' + type + '\' is either unsupported or should not be stringified.');
    }

    return value;
  }

  // TODO: remove
  jsify(isColor = false) { // encodes field values in a format compliant for the template engine VRLM generation
    return ''// '{value: ' + this.#jsifyVariable(this.value, this.type, isColor) + ', defaultValue: ' + this.#jsifyVariable(this.defaultValue, this.type, isColor) + '}';
  }

  // TODO: remove
  #jsifyVariable(variable, type, isColor) {
    switch (type) {
      case VRML.SFBool:
      case VRML.SFFloat:
      case VRML.SFInt32:
      case VRML.SFString: // note: when parsing SFStrings the quotation marks are kept, so no need to add it here
        return variable;
      case VRML.SFVec2f:
        return '{x: ' + variable.x + ', y: ' + variable.y + '}';
      case VRML.SFVec3f:
      case VRML.SFColor:
        if (isColor)
          return '{r: ' + variable.x + ', g: ' + variable.y + ', b: ' + variable.z + '}';
        return '{x: ' + variable.x + ', y: ' + variable.y + ', z: ' + variable.z + '}';
      case VRML.SFRotation:
        return '{x: ' + variable.x + ', y: ' + variable.y + ', z: ' + variable.z + ', w: ' + variable.w + '}';
      case VRML.SFNode: {
        let text = '{'
        if (typeof variable !== 'undefined' && typeof ProtoModel[variable] !== 'undefined') {
          text += 'node_name: \'${variable}\', ';

        }
        return text;
      }
      case VRML.MFString: {
        let text = '[';
        for (let i = 0; i < variable.length; ++i)
          text += '\'' + variable[i] + '\', ';
        if (text.length > 2)
          text = text.slice(0, -2);
          text += ']';
        return text;
      }
      case VRML.MFNode: {
          let text = '[';
          for (let i = 0; i < variable.length; ++i) {
            text += this.#jsifyVariable(variable, VRML.SFNode);
          }

          return text;
      }
      default:
        throw new Error('Unknown type \'' + this.type + '\' in #jsifyVariable.');
    }
  }
};
