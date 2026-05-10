/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}", 
    "./views/**/*.{js,jsx,ts,tsx}",// <-- Chequeá que diga "views" y tenga los asteriscos correctos
    "./components/**/*.{js,jsx,ts,tsx}" // <-- Agregué esta línea para incluir los componentes
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}