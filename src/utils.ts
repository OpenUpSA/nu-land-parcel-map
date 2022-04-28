export const hlsGen = function (seed) {
  if (isNaN(seed)) {
    seed = 0;
  }
  const random = mulberry32(seed);

  let preH = 0;
  function getH() {
    while (true) {
      const newH = random() * 360;
      if (Math.abs(preH - newH) > 10) {
        preH = newH;
        return newH;
      }
    }
  }

  const H = getH();
  const L = 40 + random() * 20 + "%";
  return `hsl(${H}, 100%, ${L})`;
};

const mulberry32 = function (seed = Date.now()) {
  return function () {
    let x = (seed += 0x6d2b79f5);
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
};

export const cyrb53 = function (str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

export const roundNearest = function (num, nearest = 15000) {
  return Math.round(num / nearest) * nearest;
};
