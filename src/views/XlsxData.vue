<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  Cartesian3,
  Color,
  HeadingPitchRoll,
  JulianDate,
  Math, PathGraphics,
  Quaternion,
  SampledPositionProperty,
  SampledProperty,
  TimeInterval,
  TimeIntervalCollection,
  Transforms,
  Viewer
} from 'cesium'
import * as XLSX from 'xlsx'

type FlightData = {
  longitude: number;
  latitude: number;
  height: number;
  pitch: number;
  roll: number;
  heading: number;
  time: number;
}

const viewer = ref<Viewer | undefined>()
const flightData = ref<Array<FlightData>>([])

const initViewer = async () => {
  viewer.value = new Viewer('cesiumContainer', {
    geocoder: false, // 地理位置搜索工具
    homeButton: false,
    sceneModePicker: false, // 切换2D、3D和CV模式
    baseLayerPicker: false, // 选择三维数字地球的地图
    navigationHelpButton: false, // 帮助按钮
    animation: true, // 控制视窗动画的播放速度
    timeline: true, // 时间控制器
    fullscreenButton: false, // 全屏按钮
    shouldAnimate: true
  })
}

onMounted(() => {
  initViewer()
})

const genFlightData = (arrData: any[]): Array<FlightData> => {
  return arrData.map(item => ({
    latitude: item['纬度'],
    longitude: item['经度'],
    height: item['高度'],
    pitch: item.pitch,
    roll: item.roll,
    heading: item.yaw,
    time: item['time(s)']
  }))
}

const loadXlsxFile = (event: Event) => {
  const fileList = (event.target as HTMLInputElement).files
  if (!fileList?.length) {
    return
  }
  const reader = new FileReader()
  reader.onload = (readEvent) => {
    const data = readEvent.target?.result
    const wb = XLSX.read(data, { type: 'binary' })
    const jsonData = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])
    flightData.value = genFlightData(jsonData)
    renderXlsxData()
  }
  reader.readAsArrayBuffer(fileList[0])
}
const renderXlsxData = () => {
  if (!viewer.value || !flightData.value.length) {
    return
  }
  // 设置动画时间
  const totalSeconds = flightData.value[flightData.value.length - 1].time
  const beginTime = JulianDate.fromIso8601('2020-03-09T23:10:00Z')
  const endTime = JulianDate.addSeconds(beginTime, totalSeconds, new JulianDate())
  viewer.value.clock.startTime = beginTime.clone()
  viewer.value.clock.stopTime = endTime.clone()
  viewer.value.clock.currentTime = beginTime.clone()
  viewer.value.timeline.zoomTo(beginTime, endTime)
  viewer.value.clock.multiplier = 30
  viewer.value.clock.shouldAnimate = true
  // 设置位置和姿态
  const positionProperty = new SampledPositionProperty()
  const orientationProperty = new SampledProperty(Quaternion)
  flightData.value.forEach(({ longitude, latitude, height, heading, roll, pitch, time }) => {
    const itemTime = JulianDate.addSeconds(beginTime, time, new JulianDate())
    const position = Cartesian3.fromDegrees(longitude, latitude, height)
    positionProperty.addSample(itemTime, position)

    orientationProperty.addSample(
      itemTime,
      Transforms.headingPitchRollQuaternion(
        position,
        new HeadingPitchRoll(
          Math.toRadians(heading),
          Math.toRadians(pitch),
          Math.toRadians(roll)
        )
      )
    )
    viewer.value!.entities.add({
      description: `位置信息：(${longitude}, ${latitude}, ${height})`,
      position,
      point: { pixelSize: 3, color: Color.BLUEVIOLET }
    })
  })
  // 开始演示动画
  const availability = new TimeIntervalCollection([new TimeInterval({ start: beginTime, stop: endTime })])
  viewer.value.trackedEntity = viewer.value.entities.add({
    availability,
    position: positionProperty,
    orientation: orientationProperty,
    path: new PathGraphics({ width: 1 }),
    model: {
      uri: '/models/Cesium_Air.glb',
      minimumPixelSize: 128,
      maximumScale: 5000
    }
  })
}
</script>

<template>
  <div class="xlsx-demo position-relative">
    <div id="cesiumContainer"></div>
    <div class="form position-absolute background-white p8">
      <input type="file" @change="loadXlsxFile" accept=".xlsx">
    </div>
  </div>
</template>

<style scoped>
#cesiumContainer {
  height: 100vh;
  width: 100vw;
}

.form {
  left: 50px;
  top: 50px;
}
</style>
