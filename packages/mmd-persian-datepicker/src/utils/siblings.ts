/**
 * this function inspired by jQuery siblings. return siblings of an element;
 * @param elem a html element to find its siblings;
 */
const siblings = (elem: HTMLElement | undefined | null): [HTMLElement] | null => {
  if (!elem) {
    return null
  }

  let matched: any = []
  let tempN: any = elem

  tempN = elem.previousSibling
  for (; tempN; tempN = tempN.previousSibling) {
    if (tempN.nodeType === 1) {
      matched.push(tempN)
    }
  }

  tempN = elem.nextSibling
  for (; tempN; tempN = tempN.nextSibling) {
    if (tempN.nodeType === 1) {
      matched.push(tempN)
    }
  }

  return matched
}

export { siblings }
