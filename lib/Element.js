/**
 * @file Element Class
 * @author zdying
 */
'use strict';

const adb = require('./adb');
const Selector = require('./Selector');

const attrParentNode = Symbol('parentNode');
const attrChildNodes = Symbol('childNodes');

class Element {
  constructor(description, document) {
    let {
      // 元素类型: element
      type,
      // 元素节点名称
      name,
      // 元素属性
      attributes,
      // 父节点
      parentNode,
      // 子节点
      childNodes
    } = description;

    this.type = type;
    this.name = name;
    this.attributes = attributes;
    this.document = document;
    this[attrParentNode] = parentNode;
    this[attrChildNodes] = childNodes;
  }

  querySelector(selector) {
    let element = Selector.matche(this.childNodes, selector);
    return element;
  }

  querySelectorAll(selector) {
    let elements = Selector.matches(this.childNodes, selector);
    return elements;
  }

  getAttribute(attrName) {
    let {attributes} = this;
    if (attrName) {
      return attributes[attrName];
    } else {
      return attributes;
    }
  }

  toString() {
    let info = {
      id: this.id,
      clazz: this.className,
      package: this.package,
      desc: this.description,
      bound: this.attributes.bounds
    };
    return `[Element] ${JSON.stringify(info)}`;
  }

  async click() {
    let {adb} = this.document || {};

    if (!adb || typeof adb.click !== 'function') {
      throw `Element is not clickable`
    }

    let {bounds: {left, right, top, bottom}} = this;
    let dx = right - left;
    let dy = bottom - top;

    let x = Math.floor(left + dx / 2 + Math.random() * dx / 2);
    let y = Math.floor(top + dy / 2 + Math.random() * dy / 2);

    await adb.click(x, y);
  }

  get innerText() {

  }

  get id() {
    return this.getAttribute('resource-id');
  }

  get className() {
    return this.getAttribute('class');
  }

  get package() {
    return this.getAttribute('package');
  }

  get description() {
    return this.getAttribute('content-desc');
  }

  get bounds() {
    let bounds = this.getAttribute('bounds');
    let boundsReg = /\[(\d+),(\d+)\]\[(\d+),(\d+)\]/;
    let match = [];

    if (bounds) {
      match = bounds.match(boundsReg) || [];
    }

    return {
      // 元素最左边离屏幕最左侧的距离
      left: Number(match[1]) || 0,
      // 元素最右边离屏幕最左侧的距离
      right: Number(match[3]) || 0,
      // 元素最上边离屏幕最上侧的距离
      top: Number(match[2]) || 0,
      // 元素最下边离屏幕最上侧的距离
      bottom: Number(match[4]) || 0
    }
  }

  get childNodes() {
    let childNodes = this[attrChildNodes];
    let isDocument = this.type === 'document';
    let document = isDocument ? this : this.document;

    if (Array.isArray(childNodes) && childNodes.length > 0){
      return childNodes.map(child => {
        return new Element(child, document)
      });
    } else {
      return [];
    }
  }

  get parentNode() {
    let parentNode = this[attrParentNode];
    let isDocument = this.type === 'document';
    let document = isDocument ? this : this.document;

    if (parentNode) {
      return new Element(parentNode, document);
    } else {
      return null;
    }
  }
}

module.exports = Element;
