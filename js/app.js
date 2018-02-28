var getNei = asn => new Promise((res, rej) => {

  var api_pre = 'https://stat.ripe.net/data/asn-neighbours/data.json?resource=';
  var xhr = new XMLHttpRequest();

  xhr.open('GET', api_pre + asn);
  xhr.onload = function () {
    if (this.status == 200) {
      var data = JSON.parse(xhr.response);
      if (data.status != "ok") rej({ok: false, err: 'API not OK.'});
      res({ok: true, nei: data.data.neighbours});
    } else rej({ok: false, err: xhr.statusText});
  };
  xhr.send();

});

var container = document.getElementById('display');
var working = document.getElementById('working');
var nodes = new vis.DataSet();
var edges = new vis.DataSet();
var garph = new vis.Network(container, {nodes, edges}, {});
var visited = [];

var addNode = function(asn, dst) {
  if(!dst.get().filter(n => n.id == asn).length)
    dst.add({id: asn, label: "AS" + asn, chosen: {
      node: (values, id) => { drawNei(id); }
    }});
}

var addEdge = function(n1, n2, dst) {
  if(!dst.get().filter(e => (e.from == n1 && e.to == n2) || (e.from == n2 && e.to == n1)).length)
    dst.add({from: n1, to: n2});
}

async function drawNei(asn) {
  if(visited.includes(asn)) return;
  working.className = '';
  var nei = await getNei(asn);
  working.className = 'hide';
  if(!nei.ok) return;
  visited.push(asn);
  addNode(asn, nodes);
  nei.nei.forEach(n => {
    addNode(n.asn, nodes);
    addEdge(asn, n.asn, edges);
  });
}

drawNei(Number.parseInt(prompt('ASN to get started')));
document.addEventListener('keydown', e => {
  if(e.key == "Enter") {
    var as = prompt('Add ASN(s) to map (separate by ",")');
    as.split(',').map(n => Number.parseInt(n)).forEach(drawNei);
  }
});
