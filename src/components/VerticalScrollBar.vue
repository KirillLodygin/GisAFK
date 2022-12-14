<template>
  <div>
    <div
      v-if="height < 100"
      class="scrollbar__scrollbar-vertical"
      ref="container"
      @click="jump">

      <div
        :class="'scrollbar' + ( dragging || draggingFromParent ? '' : ' scrollbar-transition')"
        ref="scrollbar"
        @touchstart="startDrag"
        @mousedown="startDrag "
        :style="{
          height: height+'%',
          top: scrolling + '%'
        }">
      </div>

    </div>
  </div>
</template>

<script>
  export default {
    props: {
      draggingFromParent: Boolean,
      scrolling: Number,
      wrapper: Object,
      area: Object,
      onChangePosition: Function,
      onDragging: Function,
      onStopDrag: Function,
    },
    data () {
      return  {
        height: 0,
        dragging: false,
        start: 0
      }
    },
    watch: {
      'wrapper.height' (val, old) {
        this.calculateSize(this)
      },
      'area.height' (val, old) {
        this.calculateSize(this)
      }
    },
    methods: {
      startDrag(e){
        e.preventDefault()
        e.stopPropagation()
        e = e.changedTouches ? e.changedTouches[0] : e
        // Prepare to drag
        this.dragging = true;
        this.start = e.clientY
      },
      onDrag(e){
        if(this.dragging){
          // Make The Parent being in the Dragging State
          this.onDragging()
          e.preventDefault()
          e.stopPropagation()
          e = e.changedTouches ? e.changedTouches[0] : e
          const yMovement = e.clientY - this.start
          const yMovementPercentage = yMovement / this.wrapper.height * 100
          // Update the last e.clientY
          this.start = e.clientY
          // The next Vertical Value will be
          const next = this.scrolling + yMovementPercentage
          // Tell the parent to change the position
          this.onChangePosition(next, 'vertical')
        }
      },
      stopDrag(e){
        if(this.dragging){
          // Parent Should Change the Dragging State
          this.onStopDrag()
          this.dragging = false
        }
      },
      jump(e){
        const isContainer = e.target === this.$refs.container
        if(isContainer){
          // Get the Element Position
          const position = this.$refs.scrollbar.getBoundingClientRect()
          // Calculate the vertical Movement
          const yMovement = e.clientY - position.top
          const centerize = (this.height / 2)
          const yMovementPercentage = yMovement / this.wrapper.height * 100 - centerize
          // Update the last e.clientY
          this.start = e.clientY
          // The next Vertical Value will be
          const next = this.scrolling + yMovementPercentage
          // Tell the parent to change the position
          this.onChangePosition(next, 'vertical')
        }
      },
      calculateSize(source){
        // Scrollbar Height
        this.height = source.wrapper.height / source.area.height * 100
      },
      getSize(){
        // The Elements
        const $scrollArea = this.$refs.container.parentElement
        const $scrollWrapper = $scrollArea.parentElement
        // Get new Elements Size
        const elementSize = {
          // Scroll Area Height and Width
          scrollAreaHeight: $scrollArea.children[0].clientHeight,
          scrollAreaWidth: $scrollArea.children[0].clientWidth,
          // Scroll Wrapper Height and Width
          scrollWrapperHeight: $scrollWrapper.clientHeight,
          scrollWrapperWidth: $scrollWrapper.clientWidth,
        }
        return elementSize
      },
    },
    mounted() {
      this.calculateSize(this)
      // Put the Listener
      document.addEventListener("mousemove", this.onDrag)
      document.addEventListener("touchmove", this.onDrag)
      document.addEventListener("mouseup", this.stopDrag)
      document.addEventListener("touchend", this.stopDrag)
    },
    beforeDestroy() {
      // Remove the Listener
      document.removeEventListener("mousemove", this.onDrag)
      document.removeEventListener("touchmove", this.onDrag)
      document.removeEventListener("mouseup", this.stopDrag)
      document.removeEventListener("touchend", this.stopDrag)
    },
  }
</script>