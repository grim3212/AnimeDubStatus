<template>
  <div class="flex flex-col h-full w-full justify-between mb-auto bg-gray-900">
    <div class="w-full h-full text-center card text-gray-200">
      <p class="mt-7 text-7xl font-bold text-orange-400">
        {{ error.statusCode }}
      </p>
      <p class="mt-7 text-6xl">
        Oops!
      </p>
      <p class="mt-7">
        {{ error.message }}
      </p>
      <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-4" @click="handleError">
        Go Home
      </button>
    </div>
    <MyFooter />
  </div>
</template>

<script setup lang="ts">
interface IError {
    statusCode: number
    statusMessage: string
    message: string
}

const props = defineProps<{
    error: IError
}>()

const handleError = () => clearError({ redirect: '/' })

useHeadSafe({
  title: () => {
    return 'Anime Dub Status - ' + props.error.statusCode
  }
})
</script>
