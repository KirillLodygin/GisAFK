<template>
    <b-modal 
        size="xl"
        centered
        scrollabletypeof 
        id="objectEvaluation" 
        title="Оценка стоимости объекта"
        class="modal"
    >
            <div v-if="stage === 1">
                <i class="fas fa-star fw text-secondary"></i>
                Этап 1. Сравните аналоги и удалите лишние (кнопка со звёздочкой)
            </div>
            <div v-else>
                <i class="fas fa-star fw text-secondary"></i>
                Этап 2. При необходимости уберите корректирующие коэффиценты
            </div>
            <b-table-simple 
                class="table"
                bordered
                small
                fixed
            >
                <b-thead>
                    <b-tr>
                        <b-th>Наименование показателя</b-th>
                        <b-th>
                            Объект оценки
                            <b-button 
                                @click="analogCounter--" 
                                class="counter counter-backward"
                                v-if="!!analogs[3]"
                                variant="dark"
                                pill
                                :disabled="!enableCounterDecrease"
                            >
                                <i class="fas fa-arrow-left fw text-white"></i>
                            </b-button>
                        </b-th>
                            <b-th v-for="i in analogsPresent" :key="i">
                            Аналог {{analogCounter + i + 1}}
                            <i class="fas fa-star fw text-primary" @click="deleteAnalog(analogCounter + i)"></i>
                        </b-th>
                    </b-tr>
                    <b-button 
                        @click="analogCounter++" 
                        class="counter counter-forward" 
                        v-if="!!analogs[3]"
                        variant="dark"
                        pill
                        :disabled="!enableCounterIncrease"
                    >
                        <i class="fas fa-arrow-right fw text-white"></i>
                    </b-button>
                </b-thead>
                <b-tbody v-if="stage === 1">
                    <b-tr>
                        <b-td>Адрес</b-td>
                        <b-td>{{aim.address.raw}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{analogs[analogCounter + i].address.raw}}
                        </b-td>
                    </b-tr>
                    <b-tr>
                        <b-td>Тип объекта</b-td>
                        <b-td>{{aim.ads_misc["КАТЕГОРИЯ"]}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{analogs[analogCounter + i].ads_misc["КАТЕГОРИЯ"]}}
                        </b-td>
                    </b-tr>
                    <b-tr>
                        <b-td>Ссылка на объявление</b-td>
                        <b-td>{{aim.ads_link}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{analogs[analogCounter + i].ads_link}}
                        </b-td>
                    </b-tr>
                    <b-tr>
                        <b-td>Номер из объявления</b-td>
                        <b-td>{{aim.ads_num}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{analogs[analogCounter + i].ads_num}}
                        </b-td>
                    </b-tr>
                    <b-tr>
                        <b-td>Назначение объекта</b-td>
                        <b-td>{{aim.ads_misc["КАТЕГОРИЯ"]}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{analogs[analogCounter + i].ads_misc["КАТЕГОРИЯ"]}}
                        </b-td>
                    </b-tr>
                    <b-tr>
                        <b-td>Текст объявления</b-td>
                        <b-td>{{aim.ads_text_full}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{analogs[analogCounter + i].ads_text_full}}
                        </b-td>
                    </b-tr>
                    <b-tr>
                        <b-td>Краткое описание</b-td>
                        <b-td>{{aim.ads_text_short}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{analogs[analogCounter + i].ads_text_short}}
                        </b-td>
                    </b-tr>
                    <b-tr>
                        <b-td>Права на объект</b-td>
                        <b-td>{{aim.ads_type ? 'Право собственности' : 'Право аренды'}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{analogs[analogCounter + i].ads_type || 'null' === 'S'  ? 'Право собственности' : 'Право аренды'}}
                        </b-td>
                    </b-tr>
                    <b-tr>
                        <b-td>Дата</b-td>
                        <b-td>{{aim.ads_updated}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{analogs[analogCounter + i].ads_updated}}
                        </b-td>
                    </b-tr>
                    <b-tr>
                        <b-td>Наличие инженерных коммуникаций</b-td>
                        <b-td>{{aim.engeneering_communications || "-"}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{analogs[analogCounter + i].engeneering_communications || "-"}}
                        </b-td>
                    </b-tr>
                    <b-tr>
                        <b-td>Наличие строений</b-td>
                        <b-td>{{aim.has_buildings ? 'Да' : 'Нет'}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{analogs[analogCounter + i].has_buildings ? 'Да' : 'Нет'}}
                        </b-td>
                    </b-tr>
                    <b-tr>
                        <b-td>Наличие выявленных обременений</b-td>
                        <b-td>{{aim.has_encumbrance ? 'Да' : 'Нет'}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{analogs[analogCounter + i].has_encumbrance ? 'Да' : 'Нет'}}
                        </b-td>
                    </b-tr>
                    <b-tr>
                        <b-td>Наличие ж/д ветки на участке</b-td>
                        <b-td>{{aim.has_railways ? 'Да' : 'Нет'}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{analogs[analogCounter + i].has_railways ? 'Да' : 'Нет'}}
                        </b-td>
                    </b-tr>
                    <b-tr>
                        <b-td>Кадастровый номер</b-td>
                        <b-td>{{aim.kadast_number || "-"}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{analogs[analogCounter + i].kadast_number || "-"}}
                        </b-td>
                    </b-tr>
                    <b-tr>
                        <b-td>Категория земель</b-td>
                        <b-td>{{aim.land_category || "-"}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{analogs[analogCounter + i].land_category || "-"}}
                        </b-td>
                    </b-tr>
                    <b-tr>
                        <b-td>Имущественные права на земельный участок</b-td>
                        <b-td>{{aim.land_rights || "-"}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{analogs[analogCounter + i].land_rights || "-"}}
                        </b-td>
                    </b-tr>
                    <b-tr>
                        <b-td>Права на использование земельного участка</b-td>
                        <b-td>{{aim.land_ussage_rights || "-"}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{analogs[analogCounter + i].land_ussage_rights || "-"}}
                        </b-td>
                    </b-tr>
                    <b-tr>
                        <b-td>Площадь, м2</b-td>
                        <b-td>{{aim.area}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{analogs[analogCounter + i].area}}
                        </b-td>
                    </b-tr>
                    <b-tr>
                        <b-td>Дата предложения</b-td>
                        <b-td>{{aim.offer_date || "-"}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{analogs[analogCounter + i].offer_date || "-"}}
                        </b-td>
                    </b-tr>
                    <b-tr>
                        <b-td>Стоимость, р</b-td>
                        <b-td>{{aim.price_sale || aim.price_rent}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{analogs[analogCounter + i].price_sale || analogs[analogCounter + i].price_rent}}
                        </b-td>
                    </b-tr>
                    <b-tr>
                        <b-td>Расположение относительно "красной линии"</b-td>
                        <b-td>{{aim.redline_location || "-"}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{analogs[analogCounter + i].redline_location || "-"}}
                        </b-td>
                    </b-tr>
                    <b-tr>
                        <b-td>Контактное лицо</b-td>
                        <b-td>{{aim.seller_name}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{analogs[analogCounter + i].seller_name}}
                        </b-td>
                    </b-tr>
                    <b-tr>
                        <b-td>Телефон</b-td>
                        <b-td>{{aim.seller_tel}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{analogs[analogCounter + i].seller_tel}}
                        </b-td>
                    </b-tr>
                    <b-tr>
                        <b-td>Тип собственника</b-td>
                        <b-td>{{aim.seller_type === 'C' ? 'Компания' : 'Частное лицо'}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{analogs[analogCounter + i].seller_type === 'C' ? 'Компания' : 'Частное лицо'}}
                        </b-td>
                    </b-tr>
                </b-tbody>
                <b-tbody v-else>
                    <b-tr>
                        <b-td>Стоимость, р</b-td>
                        <b-td>{{getPrice(aim)}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{getPrice(analogs[analogCounter + i])}}
                        </b-td>
                    </b-tr>
                    <b-tr>
                        <b-td>Права на объект</b-td>
                        <b-td>{{aim.ads_type ? 'Право собственности' : 'Право аренды'}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{analogs[analogCounter + i].ads_type || 'null' === 'S'  ? 'Право собственности' : 'Право аренды'}}
                        </b-td>
                    </b-tr>
                    <b-tr class="subrow">
                        <b-td>Корректировка</b-td>
                        <b-td>0.00%</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            <input class="input-correction" v-model="corrections.rights[analogCounter + i]" type="number">
                        </b-td>
                    </b-tr>
                    <b-tr class="subrow">
                        <b-td>Скорректированная стоимость</b-td>
                        <b-td>{{getPrice(aim)}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{(getPrice(analogs[analogCounter + i]) * sumCorrection("rights",analogCounter + i)).toFixed(2)}}
                        </b-td>
                    </b-tr>
                    <b-tr>
                        <b-td>Условия финансирования</b-td>
                        <b-td>Типичные</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            Типичные
                        </b-td>
                    </b-tr>
                    <b-tr class="subrow">
                        <b-td>Корректировка</b-td>
                        <b-td>0.00%</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            <input class="input-correction" v-model="corrections.fin_cond[analogCounter + i]" type="number">
                        </b-td>
                    </b-tr>
                    <b-tr class="subrow">
                        <b-td>Скорректированная стоимость</b-td>
                        <b-td>{{getPrice(aim)}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{(getPrice(analogs[analogCounter + i]) * sumCorrection("fin_cond",analogCounter + i)).toFixed(2)}}
                        </b-td>
                    </b-tr>
                    <b-tr>
                        <b-td>Условия продажи</b-td>
                        <b-td>Типичные</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            Сделка
                        </b-td>
                    </b-tr>
                    <b-tr class="subrow">
                        <b-td>Корректировка</b-td>
                        <b-td>0.00%</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            <input class="input-correction" v-model="corrections.sale_cond[analogCounter + i]" type="number">
                        </b-td>
                    </b-tr>
                    <b-tr class="subrow">
                        <b-td>Скорректированная стоимость</b-td>
                        <b-td>{{getPrice(aim)}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{(getPrice(analogs[analogCounter + i]) * sumCorrection("sale_cond",analogCounter + i)).toFixed(2)}}
                        </b-td>
                    </b-tr>
                    <b-tr>
                        <b-td>Период между датами сделок и оценки</b-td>
                        <b-td>{{aim.offer_date || "-"}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{analogs[analogCounter + i].offer_date || "-"}}
                        </b-td>
                    </b-tr>
                    <b-tr class="subrow">
                        <b-td>Корректировка</b-td>
                        <b-td>0.00%</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            <input class="input-correction" v-model="corrections.period[analogCounter + i]" type="number">
                        </b-td>
                    </b-tr>
                    <b-tr class="subrow">
                        <b-td>Скорректированная стоимость</b-td>
                        <b-td>{{getPrice(aim)}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{(getPrice(analogs[analogCounter + i]) * sumCorrection("period",analogCounter + i)).toFixed(2)}}
                        </b-td>
                    </b-tr>
                    <b-tr>
                        <b-td>Наличие инженерных коммуникаций</b-td>
                        <b-td>{{aim.engeneering_communications || "-"}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{analogs[analogCounter + i].engeneering_communications || "-"}}
                        </b-td>
                    </b-tr>
                    <b-tr class="subrow">
                        <b-td>Корректировка</b-td>
                        <b-td>0.00%</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            <input class="input-correction" v-model="corrections.engeneering_communications[analogCounter + i]" type="number">
                        </b-td>
                    </b-tr>
                    <b-tr class="subrow">
                        <b-td>Скорректированная стоимость</b-td>
                        <b-td>{{getPrice(aim)}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{(getPrice(analogs[analogCounter + i]) * sumCorrection("engeneering_communications",analogCounter + i)).toFixed(2)}}
                        </b-td>
                    </b-tr>
                    <b-tr>
                        <b-td>Наличие выявленных обременений</b-td>
                        <b-td>{{aim.has_encumbrance ? 'Да' : 'Нет'}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{analogs[analogCounter + i].has_encumbrance ? 'Да' : 'Нет'}}
                        </b-td>
                    </b-tr>
                    <b-tr class="subrow">
                        <b-td>Корректировка</b-td>
                        <b-td>0.00%</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            <input class="input-correction" v-model="corrections.has_encumbrance[analogCounter + i]" type="number">
                        </b-td>
                    </b-tr>
                    <b-tr class="subrow">
                        <b-td>Скорректированная стоимость</b-td>
                        <b-td>{{getPrice(aim)}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{(getPrice(analogs[analogCounter + i]) * sumCorrection("has_encumbrance",analogCounter + i)).toFixed(2)}}
                        </b-td>
                    </b-tr>
                    <b-tr>
                        <b-td>Наличие ж/д ветки на участке</b-td>
                        <b-td>{{aim.has_railways ? 'Да' : 'Нет'}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{analogs[analogCounter + i].has_railways ? 'Да' : 'Нет'}}
                        </b-td>
                    </b-tr>
                    <b-tr class="subrow">
                        <b-td>Корректировка</b-td>
                        <b-td>0.00%</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            <input class="input-correction" v-model="corrections.has_railways[analogCounter + i]" type="number">
                        </b-td>
                    </b-tr>
                    <b-tr class="subrow">
                        <b-td>Скорректированная стоимость</b-td>
                        <b-td>{{getPrice(aim)}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{(getPrice(analogs[analogCounter + i]) * sumCorrection("has_railways",analogCounter + i)).toFixed(2)}}
                        </b-td>
                    </b-tr>
                    <b-tr>
                        <b-td>Категория земель</b-td>
                        <b-td>{{aim.land_category}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{analogs[analogCounter + i].land_category}}
                        </b-td>
                    </b-tr>
                    <b-tr class="subrow">
                        <b-td>Корректировка</b-td>
                        <b-td>0.00%</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            <input class="input-correction" v-model="corrections.land_category[analogCounter + i]" type="number">
                        </b-td>
                    </b-tr>
                    <b-tr class="subrow">
                        <b-td>Скорректированная стоимость</b-td>
                        <b-td>{{getPrice(aim)}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{(getPrice(analogs[analogCounter + i]) * sumCorrection("land_category",analogCounter + i)).toFixed(2)}}
                        </b-td>
                    </b-tr>
                    <b-tr>
                        <b-td>Права на использование земель</b-td>
                        <b-td>{{aim.land_ussage_rights}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{analogs[analogCounter + i].land_ussage_rights}}
                        </b-td>
                    </b-tr>
                    <b-tr class="subrow">
                        <b-td>Корректировка</b-td>
                        <b-td>0.00%</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            <input class="input-correction" v-model="corrections.land_ussage_rights[analogCounter + i]" type="number">
                        </b-td>
                    </b-tr>
                    <b-tr class="subrow">
                        <b-td>Скорректированная стоимость</b-td>
                        <b-td>{{getPrice(aim)}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{(getPrice(analogs[analogCounter + i]) * sumCorrection("land_ussage_rights",analogCounter + i)).toFixed(2)}}
                        </b-td>
                    </b-tr>
                    <b-tr>
                        <b-td>Площадь, м2</b-td>
                        <b-td>{{aim.object_area}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{analogs[analogCounter + i].object_area}}
                        </b-td>
                    </b-tr>
                    <b-tr class="subrow">
                        <b-td>Корректировка</b-td>
                        <b-td>0.00%</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            <input class="input-correction" v-model="corrections.object_area[analogCounter + i]" type="number">
                        </b-td>
                    </b-tr>
                    <b-tr class="subrow">
                        <b-td>Скорректированная стоимость</b-td>
                        <b-td>{{getPrice(aim)}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{(getPrice(analogs[analogCounter + i]) * sumCorrection("object_area",analogCounter + i)).toFixed(2)}}
                        </b-td>
                    </b-tr>
                    <b-tr>
                        <b-td>Расположение относительно "красной линии"</b-td>
                        <b-td>{{aim.redline_location || "-"}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{analogs[analogCounter + i].redline_location || "-"}}
                        </b-td>
                    </b-tr>
                    <b-tr class="subrow">
                        <b-td>Корректировка</b-td>
                        <b-td>0.00%</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            <input class="input-correction" v-model="corrections.redline_location[analogCounter + i]" type="number">
                        </b-td>
                    </b-tr>
                    <b-tr class="subrow">
                        <b-td>Скорректированная стоимость</b-td>
                        <b-td>{{getPrice(aim)}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{(getPrice(analogs[analogCounter + i]) * sumCorrection("redline_location",analogCounter + i)).toFixed(2)}}
                        </b-td>
                    </b-tr>
                    <b-tr>
                        <b-td>Расположение в городской черте</b-td>
                        <b-td>{{"Да"}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{"Да"}}
                        </b-td>
                    </b-tr>
                    <b-tr class="subrow">
                        <b-td>Корректировка</b-td>
                        <b-td>0.00%</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            <input class="input-correction" v-model="corrections.inside_city[analogCounter + i]" type="number">
                        </b-td>
                    </b-tr>
                    <b-tr class="subrow">
                        <b-td>Скорректированная стоимость</b-td>
                        <b-td>{{getPrice(aim)}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{(getPrice(analogs[analogCounter + i]) * sumCorrection("inside_city",analogCounter + i)).toFixed(2)}}
                        </b-td>
                    </b-tr>
                    <b-tr>
                        <b-td>Наличие асфальтового покрытия</b-td>
                        <b-td>{{"Да"}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{"Да"}}
                        </b-td>
                    </b-tr>
                    <b-tr class="subrow">
                        <b-td>Корректировка</b-td>
                        <b-td>0.00%</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            <input class="input-correction" v-model="corrections.asphalt_pavement[analogCounter + i]" type="number">
                        </b-td>
                    </b-tr>
                    <b-tr class="subrow">
                        <b-td>Скорректированная стоимость</b-td>
                        <b-td>{{getPrice(aim)}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{(getPrice(analogs[analogCounter + i]) * sumCorrection("asphalt_pavement",analogCounter + i)).toFixed(2)}}
                        </b-td>
                    </b-tr>
                    <b-tr>
                        <b-td>Рельеф</b-td>
                        <b-td>{{"Равнина"}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{"Равнина"}}
                        </b-td>
                    </b-tr>
                    <b-tr class="subrow">
                        <b-td>Корректировка</b-td>
                        <b-td>0.00%</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            <input class="input-correction" v-model="corrections.relief[analogCounter + i]" type="number">
                        </b-td>
                    </b-tr>
                    <b-tr class="subrow">
                        <b-td>Скорректированная стоимость</b-td>
                        <b-td>{{getPrice(aim)}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{(getPrice(analogs[analogCounter + i]) * sumCorrection("relief",analogCounter + i)).toFixed(2)}}
                        </b-td>
                    </b-tr>
                    <b-tr>
                        <b-td>Характеристики расположения</b-td>
                        <b-td>{{"Обычные"}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{"Обычные"}}
                        </b-td>
                    </b-tr>
                    <b-tr class="subrow">
                        <b-td>Корректировка</b-td>
                        <b-td>0.00%</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            <input class="input-correction" v-model="corrections.locations_characteristics[analogCounter + i]" type="number">
                        </b-td>
                    </b-tr>
                    <b-tr class="subrow">
                        <b-td>Скорректированная стоимость</b-td>
                        <b-td>{{getPrice(aim)}}</b-td>
                        <b-td v-for="i in analogsPresent" :key="i">
                            {{(getPrice(analogs[analogCounter + i]) * sumCorrection("locations_characteristics",analogCounter + i)).toFixed(2)}}
                        </b-td>
                    </b-tr>
                </b-tbody>
            </b-table-simple>
            <div v-if="stage === 2">
                Рыночная стоимость объекта недвижимости:
                <i style="float: right;">
                    {{weightedPrice}}
                </i>
                <br>
                Рыночная стоимость объекта недвижимости за кв.м:
                <i style="float: right;">
                    {{weighedPriceArea}} 
                </i>
            </div>
    </b-modal>
</template>

<script>
   export default {
    name: "ObjectEvaluation",
    props: {
        ids: {type: Object, required: true}
    },
    data() {
        return {
            // данные
            aim: {},
            analogs: [],
            corrections: {
                rights: [],
                fin_cond: [],
                sale_cond: [],
                period: [],
                engeneering_communications: [],
                has_encumbrance: [],
                has_railways: [],
                land_category: [],
                land_ussage_rights: [],
                object_area: [],
                redline_location: [],
                inside_city: [],
                asphalt_pavement: [],
                relief: [],
                locations_characteristics: []
            },
            firstIndependantCorrection: 'engeneering_communications',

            // отображение
            analogCounter: 0,
            loaded: false,
            analogsMax: 3,
            enableCounterIncrease: true,
            enableCounterDecrease: false,
            stage: 1
        }
    },
    computed: {
        analogsPresent() {
            const range = []
            const max = Math.min(this.analogsMax, this.analogs.length)
            for (let i = 0; i < max; i++) {
                range.push(i)
            }
            return range
        },
        weightedPrice() {
            let prices = 0
            const coefficients = []
            let coefSum = 0
            for (let i = 0; i < this.analogs.length; i++) {
                let procentSum = 0 // p
                if (+this.absoluteSumCorrection(i) === 0) {
                    procentSum = 1
                }
                else {
                    procentSum = +this.absoluteSumCorrection(i)
                }
                
                const coef = 1/procentSum // 1/p = c
                coefficients.push(coef)
                coefSum = coefSum + coef // c1+c2+c3+cn
            }

            for (let n = 0; n < this.analogs.length; n++) {
                const weight = coefficients[n]/coefSum  // d
                const price = +this.getPrice(this.analogs[n]) * +this.sumCorrection("", n) // s

                prices = prices + (price*weight)
            }
            return prices.toFixed(2)
        },
        weighedPriceArea() {
            let area = 0
            for (let i = 0; i < this.analogs.length; i++) {
                area = area + this.analogs[i].object_area
            }
            return (this.weightedPrice / area).toFixed(2)
        }
    },
    watch: {
        ids: {
            handler() {
                this.getObjects() 
            },
            deep:true
        },
        analogCounter(newValue) {
            this.checkCounter(newValue)
        }
    },
    created() {
        this.getObjects()
        
    },
    mounted() {
        this.$root.$on('bv::modal::hide', (bvEvent, modalId) => {
            if (this.stage === 1) {
                bvEvent.preventDefault()
                this.initCorrections()
                this.stage = 2
            }
            else {
                this.stage = 1
            }
        })
    },
    methods: {
        show() {
            this.$bvModal.show("objectEvaluation");
            this.getObjects();
            this.checkCounter(this.analogCounter)
        },
        async getObjects() {
            const aimResponse = await this.$axios.get("api/v1/realty/landplots/" + this.ids.aim)
            this.aim = aimResponse.data

            this.analogs = []
            this.ids.analogs.forEach(this.getAnalog)
        },
        async getAnalog(id) {
            const analogResponse = await this.$axios.get("api/v1/realty/landplots/" + id)
            this.analogs.push(analogResponse.data)
        },
        deleteAnalog(index) {
            this.$store.commit('removeAnalog', index);
        },
        checkCounter(newValue) {
            this.enableCounterIncrease = (newValue + 3 < this.analogs.length)
            this.enableCounterDecrease = (newValue > 0)
        },
        serialCorrection(stopField,index) {
            let coefficient = 1;
            for (const key in this.corrections) {
                const singleCoefficient = (100 + +this.corrections[key][index])/100
                coefficient = coefficient * singleCoefficient

                if (key === stopField) {
                    break
                }
            }
            return coefficient
        },
        independentCorrections(startIndex, index) {
            const keys = Object.keys(this.corrections)

            let procent = 0
            for (let i = startIndex; i < keys.length; i++) {
                procent = procent + +this.corrections[keys[i]][index]
            }

            const coefficient = (100 + procent)/100
            return coefficient
        },
        sumCorrection(stopField,analogIndex) {
            const keys = Object.keys(this.corrections)
            const stopIndex = keys.indexOf(stopField)
            const firstIndependantIndex = keys.indexOf(this.firstIndependantCorrection)

            let coefficient = 0
            if (stopIndex === -1 || (stopIndex >= firstIndependantIndex)) {
                coefficient = this.serialCorrection(keys[firstIndependantIndex - 1], analogIndex) * this.independentCorrections(firstIndependantIndex,analogIndex)
            }
            else {
                coefficient = this.serialCorrection(stopField, analogIndex)
            }

            return coefficient
        },
        getPrice(object) {
            return object.price_sale || object.price_rent
        },
        initCorrections() {
            for (const key in this.corrections){
                for (let i = 0; i < this.analogs.length; i++) {
                    this.corrections[key][i] = 0
                }
            }
        },
        absoluteSumCorrection(index) {
            let procent = 0;
            for (const key in this.corrections) {
                const singleProcent = Math.abs(+this.corrections[key][index])
                procent = procent + singleProcent
            }
            return procent
        }
    },
   }
</script>

<style scoped>
    th, td {
        overflow: hidden;
        text-overflow: ellipsis;
        padding: 1%
    }
    .counter {
        position: absolute;
        top: 35px;
    }
    .counter-forward {
        right: 0px;
    }
    .counter-backward{
        left: 39%; 
    }
    .subrow {
        line-height: 12px;
        min-height: 12px;
        height: 12px;
    }
    .subrow > td {
        padding-top: 7px;
        padding-bottom: 7px; 
        font-size: 0.85rem;
        font-style: italic;
    }
    tr:not(.subrow):nth-child(odd){
        background-color: rgba(0,0,0,.03);
    }
    tr.subrow:nth-child(6n), tr.subrow:nth-child(6n+1){
        background-color: rgba(0,0,0,.03);
    }
    thead > tr {
        background-color: #ffffff;
    }
</style>