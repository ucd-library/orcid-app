let ele = document.createElement('div');
ele.style.display = 'fixed';
ele.style.left = '0';
ele.style.right = '0';
ele.style.bottom = '0';
ele.innerHTML = 'This is a test, this is only a test';
ele.style.background = 'white';
ele.style.border = '1px solid #ccc';
ele.style.boxShadow = '0 0 5px black';
document.body.appendChild(ele);

console.log(document.querySelector('[name="_csrf"]').getAttribute('content'));

(async function() {
  let t = await fetch('/delegators/delegators-and-me.json')
  console.log(await t.json())
})();