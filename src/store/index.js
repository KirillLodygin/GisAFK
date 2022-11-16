export const state = () => ({
  // Активная панель в левой части основной страницы (search, analogs, layers, details, ...)
  sidePanel: 'search',
  // Режим работы с картой (free - свободное перемещение, measure - измерение расстояния
  // frameCircle - рисование круговой рамки, frameRect - рисование прямоугольной рамки)
  mapMode: 'free',
  // Искомый адрес на карте
  goToAddress: {},
  // Объект слоя, выделенный на карте
  selectedMapObject: null,
  // Данные слоёв
  layersTreeData: [],
  // Список аналогов для сравнения с целевым объектом
  analogs: [],
  // Целевой объект для сравнения с аналогами
  aim: null,
  // Список полей по видам недвижимости
  realtyFields: {},
  // Список полей для отображения на панели поиска
  searchFields: {},
})

// Возвращает элемент дерева по id
function getTreeItem(_tree, id) {
  var memory = []
  // в начале память содержит ссылки на корневые элементы
  _tree.forEach((item) => memory.push(item))
  let curItem // текущий элемент

  // закончить цикл, если не получается извлечь элемент из памяти
  while (memory.length) {
    curItem = memory.pop()
    if (curItem.node.id === id) return curItem
    if (curItem.tree) {
      // помещаем дочерние элементы в память
      for (let i = 0; i < curItem.tree.length; i++) {
        memory.push(curItem.tree[i])
      }
    }
  }
  return null
}

export const getters = {
  isSidePanel: (state) => (panel) => {
    return state.sidePanel === panel
  },
  // Возвращает слой (элемент дерева слоёв) по id
  getLayersTreeItem: (state) => (id) => {
    return getTreeItem(state.layersTreeData, id)
  },
  // Возвращает аналог по id
  getAnalog: (state) => (id) => {
    return state.analogs.find((item) => item.id === id)
  },
  // Возвращает индекс аналога в списке аналогов по id
  getAnalogIndex: (state) => (id) => {
    return state.analogs.findIndex((item) => item.id === id)
  },
  isAim: (state) => (id) => {
    return state.aim && state.aim.id === id
  },
}

export const mutations = {
  setSidePanel(state, value) {
    state.sidePanel = value
  },
  setMapMode(state, value) {
    state.mapMode = value
  },
  setGoToAddress(state, value) {
    state.goToAddress = value
  },
  setSelectedMapObject(state, value) {
    state.selectedMapObject = value
  },
  setLayersTreeData(state, value) {
    state.layersTreeData = value
  },
  // Устанавливает флажок загрузки loading для слоя по его id
  setLayerItemLoading(state, id) {
    var item = getTreeItem(state.layersTreeData, id)
    if (item) item.loading = true
  },
  // Устанавливает флажок окончания загрузки finished для слоя по его id
  setLayerItemFinished(state, id) {
    var item = getTreeItem(state.layersTreeData, id)
    if (item) item.loading = false
  },
  // Устанавливает значение атрибута для слоя по его id
  setLayerItemProperty(state, params) {
    var item = getTreeItem(state.layersTreeData, params.id)
    if (item) item[params.prop] = params.value
  },
  setAnalogs(state, value) {
    state.analogs = value
  },
  addAnalog(state, value) {
    state.analogs.push(value)
  },
  removeAnalog(state, index) {
    state.analogs.splice(index, 1)
  },
  setAim(state, value) {
    state.aim = value
  },
  setRealtyFields(state, value) {
    state.realtyFields = value
  },
  setSearchFields(state, value) {
    state.searchFields = value
  },
  setSearchField(state, params) {
    state.searchFields[params.name] = params.value
  },
}

export const actions = {
  toggleSidePanel(context, panel) {
    if (context.state.sidePanel !== panel) context.commit('setSidePanel', panel)
    else context.commit('setSidePanel', 'search')
  },
  // Добавление или удаление объекта карты к списку аналогов
  toggleAnalog(context, advItem) {
    const index = context.getters.getAnalogIndex(advItem.id)
    if (index >= 0) {
      context.commit('removeAnalog', index)
    } else {
      if (context.state.aim && advItem.id === context.state.aim.id) context.commit('setAim', null)
      context.commit('addAnalog', advItem)
    }
  },
  toggleAim(context, advItem) {
    if (context.getters.isAim(advItem.id)) {
      context.commit('setAim', null)
    } else {
      const index = context.getters.getAnalogIndex(advItem.id)
      if (index >= 0) {
        context.commit('removeAnalog', index)
      }
      context.commit('setAim', advItem)
    }
  },
  toggleAimAnalog(context, advItem) {
    const index = context.getters.getAnalogIndex(advItem.id)
    if (index >= 0) {
      context.commit('removeAnalog', index)
      if (context.state.aim) {
        context.commit('addAnalog', context.state.aim)
      }
      context.commit('setAim', advItem)
    } else {
      if (context.state.aim && advItem.id === context.state.aim.id) context.commit('setAim', null)
      context.commit('addAnalog', advItem)
    }
  },
  async getReportingTableStructure() {
    return await this.$axios.options('/api/v1/order/reference_book_groups/')
  },
  async getReferenceBookGroupList() {
    return await this.$axios.get('/api/v1/order/reference_book_groups/')
  },
}
