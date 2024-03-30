<script setup lang="ts">
// 控制模型姿态
import { onMounted, ref, watch } from 'vue'
import { Viewer, Math, HeadingPitchRoll, Transforms, Cartesian3, Matrix4, Matrix3, Model } from 'cesium'

const viewer = ref<Viewer | undefined>()
const model = ref<Model | undefined>()

const initViewer = () => {
  viewer.value = new Viewer('cesiumContainer', {
    geocoder: false, // 地理位置搜索工具
    // homeButton: true, // 点击之后恢复默认视角
    sceneModePicker: false, // 切换2D、3D和CV模式
    baseLayerPicker: false, // 选择三维数字地球的地图
    navigationHelpButton: false, // 帮助按钮
    animation: false, // 控制视窗动画的播放速度
    timeline: false, // 时间控制器
    fullscreenButton: false, // 全屏按钮
    shouldAnimate: true
  })
}
const loadModel = async () => {
  const { lon, lat, height } = formData.value
  const modelMatrix = Transforms.eastNorthUpToFixedFrame(Cartesian3.fromDegrees(lon, lat, height))
  model.value = await Model.fromGltfAsync({
    url: '/models/Cesium_Air.glb',
    modelMatrix,
    minimumPixelSize: 128,
    maximumScale: 5000
  })
  viewer.value?.scene.primitives.add(model.value)
  handleLocation()
}

const init = () => {
  initViewer()
  loadModel()
}
const formData = ref({
  lon: 110,
  lat: 30,
  height: 300,
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  offsetZ: 0,
  heading: 0,
  pitch: 0,
  roll: 0
})

onMounted(() => {
  init()
})
const handleLocation = () => {
  const { lon, lat, height } = formData.value
  viewer.value?.camera.flyTo({
    destination: Cartesian3.fromDegrees(lon, lat, height + 120)
  })
}

const changePos = () => {
  // 确定矩阵变化的原点
  const { lon, lat, height, scale, offsetX, offsetY, offsetZ, heading, pitch, roll } = formData.value
  const origin = Cartesian3.fromDegrees(lon, lat, height)
  const transform = Transforms.eastNorthUpToFixedFrame(origin)
  // 缩放
  const targetScale = Matrix4.fromScale(new Cartesian3(scale, scale, scale))
  Matrix4.multiply(transform, targetScale, transform)
  // 平移
  const translation = Matrix4.fromTranslation(new Cartesian3(offsetX, offsetY, offsetZ))
  Matrix4.multiply(transform, translation, transform)
  // 旋转
  const hpr = new HeadingPitchRoll(
    Math.toRadians(heading),
    Math.toRadians(pitch),
    Math.toRadians(roll)
  )
  const rotation = Matrix4.fromRotationTranslation(Matrix3.fromHeadingPitchRoll(hpr))
  Matrix4.multiply(transform, rotation, transform)
  model.value!.modelMatrix = transform
}
watch(() => formData.value,
  () => {
    changePos()
  },
  {
    immediate: false,
    deep: true
  })
</script>

<template>
  <div class="position-relative">
    <div id="cesiumContainer"></div>
    <el-form
      :model="formData" class="form position-absolute p-16" label-width="auto" label-position="left">
      <el-form-item>
        <div class="title">模型姿态动态调整</div>
      </el-form-item>
      <el-form-item label="经度">
        <el-input v-model.number="formData.lon" />
      </el-form-item>
      <el-form-item label="维度">
        <el-input v-model.number="formData.lat" />
      </el-form-item>
      <el-form-item label="高度">
        <el-input v-model.number="formData.height" />
      </el-form-item>
      <el-form-item label="缩放比例">
        <el-slider v-model.number="formData.scale" :min="1" :max="50" />
      </el-form-item>
      <el-form-item label="平移-X">
        <el-slider v-model.number="formData.offsetX" :min="-50" :max="50" />
      </el-form-item>
      <el-form-item label="平移-Y">
        <el-slider v-model.number="formData.offsetY" :min="-50" :max="50" />
      </el-form-item>
      <el-form-item label="平移-Z">
        <el-slider v-model.number="formData.offsetZ" :min="-50" :max="50" />
      </el-form-item>
      <el-form-item label="航向角">
        <el-slider v-model.number="formData.heading" :min="1" :max="360" />
      </el-form-item>
      <el-form-item label="俯仰角">
        <el-slider v-model.number="formData.pitch" :min="1" :max="360" />
      </el-form-item>
      <el-form-item label="翻滚角">
        <el-slider v-model.number="formData.roll" :min="1" :max="360" />
      </el-form-item>
      <el-form-item label-width=" ">
        <el-button type="primary" @click="handleLocation">定位</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
#cesiumContainer {
  width: 100vw;
  height: 100vh;
}

.form {
  background: white;
  top: 8px;
  left: 8px;
  border-radius: 8px;
}
</style>