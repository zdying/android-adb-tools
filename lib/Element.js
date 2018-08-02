/**
 * @file Element Class
 * @author zdying
 */
'use strict';

class Element {
  constructor(description) {
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
    this.parentNode = parentNode;
    this.childNodes = childNodes;
  }

  querySelector(selector) {

  }

  querySelectorAll(selector) {

  }

  getAttribute(attrName) {
    let {attributes} = this;
    if (attrName) {
      return attributes[attrName];
    } else {
      return attributes;
    }
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
}
