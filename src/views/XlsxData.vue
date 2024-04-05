<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import {
  Cartesian3,
  ClockRange,
  Color, Ellipsoid,
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
  viewer.value.clock.shouldAnimate = false
  currPos.lat = flightData[0].latitude + ''
  currPos.lon = flightData[0].longitude + ''
  currPos.height = flightData[0].height + ''
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
  const { longitude, latitude, height } = flightData[0]
  const modelLabel = viewer.value.entities.add({
    id: 'flightModel',
    availability,
    position: positionProperty,
    orientation: orientationProperty,
    path: new PathGraphics({ width: 1, leadTime: 0, material: Color.WHITESMOKE }),
    model: {
      uri: '/models/Cesium_Air.glb',
      minimumPixelSize: 128,
      maximumScale: 5000
    },
  })
  viewer.value.trackedEntity = modelLabel
  modelLabel.viewFrom = new Cartesian3(300.0, 250.0, 100.0) as any;
  viewer.value.clock.onTick.addEventListener(() => {
    const flightEntity = viewer.value?.entities.getById('flightModel')
    const curTime = viewer.value?.clock.currentTime as JulianDate
    const pos = flightEntity?.position?.getValue(curTime, undefined) as Cartesian3
    const cartographic = Ellipsoid.WGS84.cartesianToCartographic(pos)
    const lon = Math.toDegrees(cartographic.longitude)
    const lat = Math.toDegrees(cartographic.latitude)
    const height = cartographic.height
    currPos.lat = lat.toFixed(8)
    currPos.lon = lon.toFixed(8)
    currPos.height = height.toFixed(8)
  })
}

const currPos = reactive<{ lon: string, lat: string, height: string }>({
  lon: '',
  lat: '',
  height: '',
})
const shouldAnimate = ref(false)
const handleClick = () => {
  shouldAnimate.value = !shouldAnimate.value
  viewer.value!.clock.shouldAnimate = shouldAnimate.value
}
</script>

<template>
  <div class="xlsx-demo position-relative">
    <div id="cesiumContainer"></div>
    <div class="position-absolute p-8 controller-bar">
      <el-button type="primary" @click="handleClick">{{ shouldAnimate ? '暂停' : '继续' }}</el-button>
      <div class="flex items-center justify-start mt-8 full-width">
        <span class="pr-8">经度</span><span>{{ currPos.lon }}</span>
      </div>
      <div class="flex items-center justify-start mt-8 full-width">
        <span class="pr-8">维度</span><span>{{ currPos.lat }}</span>
      </div>
      <div class="flex items-center justify-start mt-8 full-width">
        <span class="pr-8">高度</span><span>{{ currPos.height }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
#cesiumContainer {
  height: 100vh;
  width: 100vw;
}
.controller-bar {
  width: 250px;
  top: 24px;
  left: 24px;
  border-radius: 12px;
  background: rgba(42, 42, 42, 0.8);
  color: white;
}
</style>
