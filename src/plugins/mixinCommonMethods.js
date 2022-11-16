import Vue from 'vue'

Vue.mixin({
  methods: {
    // Добавляет к объекту карты nomination дополнительные поля
    mapObjectDefaults(nmObject) {
        if (nmObject.address && nmObject.category) {
            // Короткое название
            var shortNameArr = [];
            const name = nmObject.address[nmObject.category];
            if (name) shortNameArr.push(name);
            if (nmObject.address.state) shortNameArr.push(nmObject.address.state);
            if (nmObject.address.city) shortNameArr.push('г. ' + nmObject.address.city);
            if (nmObject.address.municipality) shortNameArr.push(nmObject.address.municipality);
            if (nmObject.address.road) shortNameArr.push(nmObject.address.road);
            if (nmObject.address.house_number) shortNameArr.push('д. ' + nmObject.address.house_number);
            nmObject.shortName = shortNameArr.join(', ');

            // Улица и номер дома
            shortNameArr = [];
            if (nmObject.address.road) shortNameArr.push(nmObject.address.road);
            if (nmObject.address.house_number) shortNameArr.push('д. ' + nmObject.address.house_number);
            nmObject.shortAddress = shortNameArr.join(', ');

            const categories = {
                building: { category_rus: 'Здания', icon: 'fas fa-building', ob_title: 'Здание' },
                amenity: { category_rus: 'Сфера услуг', icon: 'fas fa-user-friends', ob_title: 'Объект сферы услуг' },
                tourism: { category_rus: 'Туризм', icon: 'fas fa-suitcase', ob_title: 'Туристический объект' },
                leisure: { category_rus: 'Досуг', icon: 'fas fa-coffee', ob_title: 'Объект досуга' },
                shop: { category_rus: 'Торговля', icon: 'fas fa-shopping-cart', ob_title: 'Магазин' },
                highway: { category_rus: 'Трассы', icon: 'fas fa-road', ob_title: 'Трасса' },
                waterway: { category_rus: 'Водоёмы', icon: 'fas fa-water', ob_title: 'Водоём' },
                aeroway: { category_rus: 'Аэропорты', icon: 'fas fa-plane', ob_title: 'Аэропорт' },
                boundary: { category_rus: 'Границы', icon: 'fas fa-expand', ob_title: 'Административное образование' },
            };
            // Название
            if (nmObject.category in categories) {
                nmObject.category_rus = categories[nmObject.category].category_rus;
                nmObject.title = categories[nmObject.category].ob_title + ' #' + nmObject.place_id;
                nmObject.icon = categories[nmObject.category].icon;
            }
            else {
                nmObject.title = nmObject.category + ' #' + nmObject.place_id;
                nmObject.icon = 'fas fa-question-circle';
            }
            if (name) nmObject.title = name;
        }
    },
    // Создаёт source и layer на карте для отображения границ объекта nomination
    nmObjectAddSource(nmObject) {      
        if (!nmObject || !nmObject.address) return;

        const objectTitle = nmObject.address[nmObject.category];
        const targetObject = {
            id: nmObject.place_id,
            type: 'Feature',
            properties: {
                description: objectTitle,
                lng: nmObject.lon,
                lat: nmObject.lat
            },
            geometry: {
                type: nmObject.geojson.type,
                coordinates: nmObject.geojson.coordinates,
            }
        };
        const targetObjectSource = this.map.getSource('targetObject');
        if (targetObjectSource) {
            targetObjectSource.setData({
            type: 'FeatureCollection',
            features: [targetObject]
            }); 
        }
        else {
            this.map.addSource('targetObject', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: [targetObject]
            }
            });
            this.map.addLayer({
                id: 'targetObjectBorders',
                type: 'line',
                source: 'targetObject',
                paint: {
                    'line-color': '#627BC1',
                    'line-width': 2
                }
            });
        }
    },
  }
})