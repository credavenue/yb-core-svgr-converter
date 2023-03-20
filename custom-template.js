
let hasStroke = false
function addColorConditionForChildren(children) {
    if (children == undefined) { return }
    if (children.length == undefined) { return }
    if (children.length <= 0) { return }
    children.forEach((value) => {
        const openingElement = value.openingElement
        if (openingElement.name.name === 'path') {
            openingElement.attributes.forEach((attribute,) => {
                addColorCondition(attribute)
            })
        }
        addColorConditionForChildren(value.children)
    })
}

function addColorCondition(attribute) {
    if (attribute.name.name === 'stroke') {
        hasStroke = true
        const colorValue = attribute.value.value
        attribute.value = {
            type: 'JSXExpressionContainer',
            expression: {
                type: 'BinaryExpression',
                operator: '??',
                left: {
                    type: 'MemberExpression',
                    object: { type: 'Identifier', name: 'props' },
                    property: { type: 'Identifier', name: 'color' },
                },
                right: {
                    type: 'StringLiteral',
                    value: colorValue,
                },
            },
        };
        return
    }
    if (attribute.name.name === 'fill') {
        const colorValue = attribute.value.value
        attribute.value = {
            type: 'JSXExpressionContainer',
            expression: {
                type: 'BinaryExpression',
                operator: '??',
                left: {
                    type: 'MemberExpression',
                    object: { type: 'Identifier', name: 'props' },
                    property: { type: 'Identifier', name: 'color' },
                },
                right: {
                    type: 'StringLiteral',
                    value: colorValue,
                },
            },
        };
    }
}

const propTypesTemplate = (
    { imports, interfaces, componentName, props, jsx, exports },
    { tpl },
) => {
    console.log(componentName)
    addColorConditionForChildren(jsx.children)
    if (!hasStroke) {
        jsx.openingElement.attributes.forEach((attribute,) => {
            addColorCondition(attribute)
        })
    }
    hasStroke = false
    return tpl`
    ${imports}
  ${interfaces}
  
  function ${componentName}(${props}) {
    return ${jsx};
  }
  
  ${exports}
    `
}

module.exports = propTypesTemplate