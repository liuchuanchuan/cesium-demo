<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  Cartesian3,
  ClockRange,
  Color,
  HeadingPitchRoll,
  JulianDate,
  Math,
  PathGraphics,
  Quaternion,
  SampledPositionProperty,
  SampledProperty,
  TimeInterval,
  TimeIntervalCollection,
  Transforms,
  Viewer
} from 'cesium'
import flightData from '@/assets/flight.json'

const viewer = ref<Viewer | undefined>()

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
  renderXlsxData()
})

const renderXlsxData = () => {
  if (!viewer.value) {
    return
  }
  // 设置动画时间
  const totalSeconds = flightData[flightData.length - 1].time
  const beginTime = JulianDate.fromIso8601('2020-03-09T23:10:00Z')
  const endTime = JulianDate.addSeconds(beginTime, totalSeconds, new JulianDate())
  viewer.value.clock.startTime = beginTime.clone()
  viewer.value.clock.stopTime = endTime.clone()
  viewer.value.clock.currentTime = beginTime.clone()
  viewer.value.timeline.zoomTo(beginTime, endTime)
  viewer.value.clock.multiplier = 30
  viewer.value.clock.shouldAnimate = true
  viewer.value.clock.clockRange = ClockRange.LOOP_STOP
  // 设置位置和姿态
  const positionProperty = new SampledPositionProperty()
  const orientationProperty = new SampledProperty(Quaternion)
  flightData.forEach(({ longitude, latitude, height, heading, roll, pitch, time }) => {
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
      point: { pixelSize: 3, color: Color.WHITESMOKE }
    })
  })
  // 开始演示动画
  const availability = new TimeIntervalCollection([new TimeInterval({ start: beginTime, stop: endTime })])
  viewer.value.trackedEntity = viewer.value.entities.add({
    id: 'flightModel',
    availability,
    position: positionProperty,
    orientation: orientationProperty,
    path: new PathGraphics({ width: 1, leadTime: 0, material: Color.WHITESMOKE }),
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
  </div>
</template>

<style scoped>
#cesiumContainer {
  height: 100vh;
  width: 100vw;
}
</style>
