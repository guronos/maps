<template>
  <v-app>
    <div>
      <v-container class="container-size">
        <h1>Добавить объект на карту</h1>
        <p>
          При клике на карту поля "Широта" и "Долгота" заполняются
          автоматически, в зависимости от расположения курсора
        </p>
        <v-row>
          <v-col cols="12" sm="6" md="4">
            <v-text-field 
            label="Широта" 
            v-model="latitude" 
            />
            <v-text-field 
            label="Долгота" 
            v-model="longitude" 
            />
            <v-text-field 
            label="Радиус в метрах" 
            v-model="radius" 
            />
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-text-field 
            label="Начальный угол" 
            v-model="cornerBegin" 
            />
            <v-text-field 
            label="Конечный угол" 
            v-model="cornerEnd" 
            />
            <v-text-field
              label="Угол поворота"
              v-model="cornerRevers"
            /> 
            </v-col>
            <v-col
            cols="12"
            sm="6"
            md="4"
            class="d-flex flex-column align-start"
          >
            <div class="color-picker-title">Выберите цвет контура</div>
            <v-color-picker
              dot-size="10"
              mode="hexa"
              swatches-max-height="200"
              width="345"
              hide-inputs
              hide-mode-switch
              @input="(event) => handleChangeColor(event, -1, true)"
            />
            <div class="d-flex justify-end btn-wrap">
              <v-btn 
              color="primary" 
              @click="handleAddMarker"
              >Добавить</v-btn>
            </div>
          </v-col>
        </v-row>
      </v-container>
      <v-container class="d-flex justify-center">
        <yandex-map
          class="container-map px-3"
          map-type="satellite"
          zoom="16"
          :coords="mapPositionCoords"
          @map-was-initialized="mapWasInitialized"
          @click="handleClickMap"
        >
          <div 
          v-for="marker in markerList" 
          :key="marker.id"
          >
            <CardMarker 
            :instansMap="instansMap" 
            :item="marker" 
            />
          </div> 
          </yandex-map
      ></v-container>
      <v-container 
      v-if="markerList.length" 
      class="container-size"
      >
        <h2 class="pb-5">Список объектов на карте</h2>
        <div 
        v-for="(marker, index) in markerList" 
        :key="marker.id"
        >
          <div>
            <h3>Объект № {{ index + 1 }}</h3>
            <v-row>
              <v-col cols="12" sm="6" md="4">
                <v-text-field 
                label="Широта" 
                v-model="marker.latitude" 
                />
                <v-text-field 
                label="Долгота" 
                v-model="marker.longitude" 
                />
                <v-text-field 
                label="Радиус в метрах" 
                v-model="marker.radius" 
                />
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  label="Начальный угол"
                  v-model="marker.cornerBegin" 
                  />
                <v-text-field
                  label="Конечный угол"
                  v-model="marker.cornerEnd" 
                  />
                <v-text-field
                  label="Угол поворота"
                  v-model="marker.cornerRevers" 
                  />
                  </v-col
              >
              <v-col
                cols="12"
                sm="6"
                md="4"
                class="d-flex flex-column align-start"
              >
                <div class="color-picker-title">Выберите цвет контура</div>
                <v-color-picker
                  dot-size="10"
                  width="345"
                  mode="hexa"
                  swatches-max-height="200"
                  hide-inputs
                  hide-mode-switch
                  @update:color="
                    (event) => handleChangeColor(event, marker.id, false)
                  "
                />
                <div class="d-flex justify-end btn-wrap">
                  <v-btn
                    color="primary"
                    class="mb-4"
                    @click="handleEditItem(marker.id)"
                    >Применить изменения</v-btn
                  >
                </div>
              </v-col>
              </v-row
            >
            <v-divider />
          </div>
        </div>
      </v-container>
    </div>
  </v-app>
</template>

<script>
import { yandexMap } from 'vue-yandex-maps';
import CardMarker from './components/CardMarker/';
export default {
  name: 'App',
  components: { yandexMap, CardMarker },
  data: () => ({
    markerList: [],
    coords: [45.022141, 41.925487],
    mapPositionCoords: [45.022121, 41.925427],
    latitude: 45.022141,
    longitude: 41.925487,
    cornerBegin: 0,
    cornerEnd: 360,
    cornerRevers: 60,
    countMarkers: 0,
    color: '#AEA3A3',
    radius: 50,
    instansMap: {},
  }),
  methods: {
    handleClickMap(event) {
      this.mapPositionCoords = event.get('coords');
      this.latitude = this.mapPositionCoords[0];
      this.longitude = this.mapPositionCoords[1];
    },
    handleChangeColor(event, id, isNew) {
      if (isNew) {
        this.color = event.hex;
      } else {
        this.markerList[id]['editColor'] = event.hex;
      }
    },
    mapWasInitialized(event) {
      this.instansMap = event;
    },
    handleAddMarker() {
      if (this.latitude && this.longitude) {
        this.coords = [this.latitude, this.longitude];
        const newItem = {
          id: this.countMarkers,
          coords: this.coords,
          radius: this.radius,
          color: this.color,
          cornerBegin: this.cornerBegin,
          cornerEnd: this.cornerEnd,
          cornerRevers: this.cornerRevers,
          latitude: this.latitude,
          longitude: this.longitude,
          edit: false,
        };
        this.markerList.push(newItem);
        this.countMarkers += 1;
        this.latitude = '';
        this.longitude = '';
      }
    },
    handleEditItem(item) {
      const { latitude, longitude, editColor } = this.markerList[item];
      this.markerList[item].coords = [latitude, longitude];
      this.markerList[item].color = editColor;
      this.markerList[item].edit = true;
      setTimeout(() => {
        this.markerList[item].edit = false;
      }, 100);
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
.container-map {
  width: 1100px;
  height: 500px;
}
.container-size {
  width: 1100px;
}
.color-picker-title {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.6);
  letter-spacing: -0.025rem;
}
.btn-wrap {
  width: 100%;
  margin-top: 1rem;
}
</style>
