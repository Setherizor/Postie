// ===== Helper functions =====
function setValue (obj, path, value) {
  var a = path.split('.')
  var o = obj
  while (a.length - 1) {
    var n = a.shift()
    if (!(n in o)) o[n] = {}
    o = o[n]
  }
  o[a[0]] = value
}

function getValue (obj, path) {
  path = path.replace(/\[(\w+)\]/g, '.$1')
  path = path.replace(/^\./, '')
  var a = path.split('.')
  var o = obj
  while (a.length) {
    var n = a.shift()
    if (!(n in o)) return
    o = o[n]
  }
  return o ? o : {}
}

const toBase64 = str => Buffer.from(str, 'utf-8').toString('base64')
const fromBase64 = base64 => Buffer.from(base64, 'base64').toString('utf-8')

export { setValue, getValue, toBase64, fromBase64 }
