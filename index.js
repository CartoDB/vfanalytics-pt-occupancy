$( document ).ready(function() {
  let map = null;

  carto.setDefaultAuth({
    user: 'dcarrion',
    apiKey: 'default_public'
  });

  const recreateMap = function () {
    map = new mapboxgl.Map({
      container: 'map',
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [-9.138222,38.740160],
      zoom: 11,
      dragRotate: false
    });
  }
  const source = new carto.source.Dataset('lisbonparishes_v2_json');

  const selectOriginalMeasure = function (columnName) {
    recreateMap();
    const viz = new carto.Viz(`
        @name: $freguesia
        @hotel_capacity: $capacidade_hoteleira
        @local_capacity: $capacidade_al
        @tourist_sleeps: $dormidas_de_turistas
        @area: $area_km2
        color: ramp(viewportQuantiles($${columnName}, 5), OrYel)
    `);
    const layer = new carto.Layer('parishes', source, viz);
    layer.addTo(map);

    const interactivity = new carto.Interactivity(layer);
    interactivity.on('featureClick', featureEvent => {
        const coords = featureEvent.coordinates;
        const feature = featureEvent.features[0];
        new mapboxgl.Popup()
            .setLngLat([coords.lng, coords.lat])
            .setHTML(`
              <h1>${feature.variables.name.value}</h1>
              <p><strong>Capacidade hoteleira</strong> ${feature.variables.hotel_capacity.value}</p>
              <p><strong>Capacidade local</strong> ${feature.variables.local_capacity.value}</p>
              <p><strong>Dormidas de turistas</strong> ${feature.variables.tourist_sleeps.value}</p>
              <p><strong>Area (km<sup>2</sup>)</strong> ${feature.variables.area.value}</p>
            `)
            .addTo(map);
    });
  }

  const selectIndex = function (columnName, columnDescription, color) {
    recreateMap();
    const viz = new carto.Viz(`
        @name: $freguesia
        @hotel_capacity: $capacidade_hoteleira
        @local_capacity: $capacidade_al
        @tourist_sleeps: $dormidas_de_turistas
        @area: $area_km2
        @index: $${columnName}
        color: ${color}
    `);
    const layer = new carto.Layer('parishes', source, viz);
    layer.addTo(map);

    const interactivity = new carto.Interactivity(layer);
    interactivity.on('featureClick', featureEvent => {
        const coords = featureEvent.coordinates;
        const feature = featureEvent.features[0];
        new mapboxgl.Popup()
            .setLngLat([coords.lng, coords.lat])
            .setHTML(`
              <h1>${feature.variables.name.value}</h1>
              <p><strong>${columnDescription}</strong> ${feature.variables.index.value}</p>
              <hr />
              <p><strong>Capacidade hoteleira</strong> ${feature.variables.hotel_capacity.value}</p>
              <p><strong>Capacidade local</strong> ${feature.variables.local_capacity.value}</p>
              <p><strong>Dormidas de turistas</strong> ${feature.variables.tourist_sleeps.value}</p>
              <p><strong>Area (km<sup>2</sup>)</strong> ${feature.variables.area.value}</p>
            `)
            .addTo(map);
    });
  }

  $("#sleeps").click(function () {
    $(".category").removeClass("selected");
    $(this).parent().addClass("selected");
    selectOriginalMeasure("dormidas_de_turistas");
  })

  $("#area").click(function () {
    $(".category").removeClass("selected");
    $(this).parent().addClass("selected");
    selectOriginalMeasure("area_km2");
  })

  $("#locals").click(function () {
    $(".category").removeClass("selected");
    $(this).parent().addClass("selected");
    selectOriginalMeasure("capacidade_al");
  })

  $("#hotels").click(function () {
    $(".category").removeClass("selected");
    $(this).parent().addClass("selected");
    selectOriginalMeasure("capacidade_hoteleira");
  })

  $("#dorm_cap_ratio").click(function () {
    $(".category").removeClass("selected");
    $(this).parent().addClass("selected");
    selectIndex("dorm_cap_ratio", "Dormidas vs. capacidade", "ramp(buckets($dorm_cap_category, ['A', 'B', 'C', 'D', 'E', 'F']), [#3d5941,#b5b991,#f6edbd,#edbb8a,#de8a5a,#ca562c])");
  })

  $("#cap_area_ratio").click(function () {
    $(".category").removeClass("selected");
    $(this).parent().addClass("selected");
    selectIndex("cap_area_ratio", "Capacidade vs. area", "ramp(viewportQuantiles($cap_area_ratio, 5), Geyser)");
  })

  $("#interest").click(function () {
    $(".category").removeClass("selected");
    $(this).parent().addClass("selected");
    selectIndex("interest", "Interesse geral", "ramp(viewportQuantiles($cap_area_ratio, 5), Geyser)");
  })

  $("#hotels").trigger("click");
});
