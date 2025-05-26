import { defineConfig, presetUno, presetAttributify, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
  ],
  shortcuts: [
    ['btn', 'px-4 py-1 rounded inline-block bg-teal-600 text-white cursor-pointer hover:bg-teal-700 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50'],
    ['btn-primary', 'bg-blue-500 hover:bg-blue-600'],
    ['btn-success', 'bg-green-500 hover:bg-green-600'],
    ['btn-warning', 'bg-yellow-500 hover:bg-yellow-600'],
    ['btn-danger', 'bg-red-500 hover:bg-red-600'],
    ['card', 'bg-white rounded-lg shadow-md p-4'],
    ['flex-center', 'flex items-center justify-center'],
    ['flex-between', 'flex items-center justify-between'],
  ],
  theme: {
    colors: {
      primary: '#409eff',
      success: '#67c23a',
      warning: '#e6a23c',
      danger: '#f56c6c',
      info: '#909399',
    },
  },
}) 