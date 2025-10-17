import { ref } from 'vue'

type ThemeType = 'dark' | 'light'
const element: Element = document.documentElement;
const theme = ref<ThemeType>("light")

const observer  =  new MutationObserver((mutationsList) => {
  for(let mutation of mutationsList) {
    if (mutation.type === 'attributes') {
      console.log("属性theme发生了变化",  document.documentElement.getAttribute(mutation.attributeName!))
      const attrVal = document.documentElement.getAttribute(mutation.attributeName!)
      theme.value = attrVal as ThemeType
    }
  }
})

observer.observe(element, {
  attributes: true,
  attributeFilter: ["theme"]
})



const initObserver = () => {
  return theme.value
}

export {
  initObserver
}
