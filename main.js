var map = new maplibregl.Map({
  container: 'map',
  style: 'https://tile.openstreetmap.jp/styles/osm-bright-ja/style.json',
  center: [135.51095750834992,34.67535490251708],
  zoom: 12,
});

map.on('load', function () {
  fetch('point2.geojson')
    .then(response => response.json())
    .then(data => {
      map.addSource('points', {
        type: 'geojson',
        data: data
      });

      // 円レイヤー
      map.addLayer({
        id: 'points-layer',
        type: 'circle',
        source: 'points',
        paint: {
          'circle-radius': 6,
          'circle-color': [
            'match',
            ['get', 'status'],
            '商談中', '#FF0000',
            '設置済', '#0000FF',
            '#888888'
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff'
        }
      });

      // ラベルレイヤー（GeN.を表示、すべて表示）
      map.addLayer({
        id: 'points-label',
        type: 'symbol',
        source: 'points',
        layout: {
          'text-field': ['get', 'GeN.'],
          'text-size': 12,
          'text-offset': [0, 1.2],
          'text-anchor': 'top',
          'text-allow-overlap': true,
          'text-ignore-placement': true
        },
        paint: {
          'text-color': '#000000',
          'text-halo-color': '#FFFF00',
          'text-halo-width': 2
        }
      });

      // ポップアップ表示
      map.on('click', 'points-layer', function (e) {
        var feature = e.features[0];
        var fid = feature.properties.fid;
        var imagePath = `pic/${fid}/1.png`;

        var html = `
          <img src="${imagePath}" alt="画像" style="width:100%; max-height:150px; object-fit:cover; cursor:pointer;" onclick="openImageViewer('${fid}', 1)">
          <br><b>取引先</b>: ${feature.properties.Client}<br>
          <b>Status</b>: ${feature.properties.status}<br>
        `;

        new maplibregl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(html)
          .addTo(map);
      });

      // カーソル変更
      map.on('mouseenter', 'points-layer', function () {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'points-layer', function () {
        map.getCanvas().style.cursor = '';
      });
    });
});

// モーダル画像ビューアのHTMLをbodyに追加
document.body.insertAdjacentHTML('beforeend', `
  <div id="image-viewer" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; text-align:center;">
    <span onclick="closeViewer()" style="position:absolute; top:10px; right:20px; font-size:30px; color:white; cursor:pointer;">×</span>
    <img id="viewer-image" src="" style="max-width:90%; max-height:80%; margin-top:5%;">
    <div style="margin-top:10px;">
      <button onclick="prevViewerImage()">←</button>
      <span id="viewer-counter" style="color:white;"></span>
      <button onclick="nextViewerImage()">→</button>
    </div>
  </div>
`);

var viewerIndex = 1;
var viewerMax = 3; // 最大画像数（必要に応じて変更）
var viewerFid = "";

function openImageViewer(fid, index) {
  viewerFid = fid;
  viewerIndex = index;
  document.getElementById('image-viewer').style.display = 'block';
  updateViewerImage();
}

function closeViewer() {
  document.getElementById('image-viewer').style.display = 'none';
}

function updateViewerImage() {
  var img = document.getElementById('viewer-image');
  var counter = document.getElementById('viewer-counter');
  img.src = `pic/${viewerFid}/${viewerIndex}.png`;
  counter.textContent = `${viewerIndex} / ${viewerMax}`;
}

function nextViewerImage() {
  if (viewerIndex < viewerMax) {
    viewerIndex++;
    updateViewerImage();
  }
}

function prevViewerImage() {
  if (viewerIndex > 1) {
    viewerIndex--;
    updateViewerImage();
  }
}
