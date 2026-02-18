import { onMounted, onBeforeUnmount } from 'vue'

export function useBodyScrollLock() {
  let scrollY = 0
  
  const lock = () => {
    scrollY = window.scrollY
    document.body.classList.add('modal-open')
    document.body.style.top = `-${scrollY}px`
  }
  
  const unlock = () => {
    document.body.classList.remove('modal-open')
    document.body.style.top = ''
    window.scrollTo(0, scrollY)
  }
  
  return {
    lock,
    unlock
  }
}