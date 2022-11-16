<template>
  <div
    @click="calculateSize"
    :class="'scrollbar__wrapper' + ( this.classes ? ' ' + this.classes : '' )"
    ref="scrollWrapper"
    :style="this.styles">

    <div
      :class="'scrollbar__area' + ( this.dragging ? ' ' : ' scrollbar-transition')"
      ref="scrollArea"
      @wheel="scroll"
      @touchstart="startDrag"
      @touchmove="onDrag"
      @touchend="stopDrag"
      :style="{
        marginTop: this.top * -1 +'px',
        marginLeft: this.left * -1 +'px'
      }">

        <slot></slot>

        <VerticalScrollBar
          v-if="ready"
          :area="{ height: scrollAreaHeight }"
          :wrapper="{ height: scrollWrapperHeight }"
          :scrolling="vMovement"
          :dragging-from-parent="dragging"
          :on-change-position="handleChangePosition"
          :on-dragging="handleScrollbarDragging"
          :on-stop-drag="handleScrollbarStopDrag" >
        </VerticalScrollBar>

        <HorizontalScrollBar
          v-if="ready"
          :area="{ width: scrollAreaWidth }"
          :wrapper="{ width: scrollWrapperWidth }"
          :scrolling="hMovement"
          :dragging-from-parent="dragging"
          :on-change-position="handleChangePosition"
          :on-dragging="handleScrollbarDragging"
          :on-stop-drag="handleScrollbarStopDrag">
        </HorizontalScrollBar>
    </div>
  </div>
</template>


<script>
  import VerticalScrollBar from './VerticalScrollBar.vue';
  import HorizontalScrollBar from './HorizontalScrollBar.vue';
  export default {
    props: {
      classes: String,
      styles: Object,
      speed: {
        type: Number,
        default: 53
      },
      onMaxScroll: Function,
    },
    components: {
      VerticalScrollBar,
      HorizontalScrollBar
    },
    data () {
      return  {
        ready: false,
        top: 0,
        left: 0,
        scrollAreaHeight: null,
        scrollAreaWidth: null,
        scrollWrapperHeight: null,
        scrollWrapperWidth: null,
        vMovement: 0,
        hMovement: 0,
        dragging: false,
        start: { y: 0, x: 0},
        allowBodyScroll: false,
      }
    },
    methods: {
      scroll(e){
        // Make sure the content height is not changed
        this.calculateSize(() => {
          // Set the wheel step
          const num = this.speed
          // DOM events
          const shifted = e.shiftKey
          const scrollY = e.deltaY > 0 ? num : -(num)
          let scrollX = e.deltaX > 0 ? num : -(num)
          // Fix Mozilla Shifted Wheel~
          if(shifted && e.deltaX === 0) scrollX = e.deltaY > 0 ? num : -(num)
          // Next Value
          const nextY = this.top + scrollY
          const nextX = this.left + scrollX
          // Is it Scrollable?
          const canScrollY = this.scrollAreaHeight > this.scrollWrapperHeight
          const canScrollX = this.scrollAreaWidth > this.scrollWrapperWidth
          // Vertical Scrolling
          if(canScrollY && !shifted) this.normalizeVertical(nextY)
          // Horizontal Scrolling
          if(shifted && canScrollX) this.normalizeHorizontal(nextX)
        })
        // prevent Default only if scrolled content is not at the top/bottom
        if (!this.allowBodyScroll) {
          e.preventDefault()
          e.stopPropagation()
        }
      },
      // DRAG EVENT JUST FOR TOUCH DEVICE~
      startDrag(e){
        this.touchEvent = e
        const evt = e.changedTouches ? e.changedTouches[0] : e
        // Make sure the content height is not changed
        this.calculateSize(() => {
          // Prepare to drag
          this.dragging = true;
          this.start = { y: evt.pageY, x: evt.pageX }
        })
      },
      onDrag(e){
        if(this.dragging){
          e.preventDefault()
          e.stopPropagation()
          // Prevent Click Event When it dragging
          if (this.touchEvent) {
            this.touchEvent.preventDefault()
            this.touchEvent.stopPropagation()
          }
          const evt = e.changedTouches ? e.changedTouches[0] : e
          // Invers the Movement
          const yMovement = this.start.y - evt.clientY
          const xMovement = this.start.x - evt.clientX
          // Update the last e.client
          this.start = { y: evt.clientY, x: evt.clientX }
          // The next Vertical Value will be
          const nextY = this.top + yMovement
          const nextX = this.left + xMovement
          this.normalizeVertical(nextY)
          this.normalizeHorizontal(nextX)
        }
      },
      stopDrag(e){
        this.dragging = false
        this.touchEvent = false
      },
      scrollToY(y) {
        this.normalizeVertical(y)
      },
      scrollToX(x) {
        this.normalizeHorizontal(x)
      },
      normalizeVertical(next){
        const elementSize = this.getSize()
        // Vertical Scrolling
        const lowerEnd = elementSize.scrollAreaHeight - elementSize.scrollWrapperHeight
        // Max Scroll Down
        const maxBottom = next > lowerEnd
        if(maxBottom) next = lowerEnd
        // Max Scroll Up
        const maxTop = next < 0
        if(maxTop) next = 0
        // Update the Vertical Value if it's needed
        const shouldScroll = this.top !== next
        this.allowBodyScroll = !shouldScroll
        if (shouldScroll) {
          this.top = next;
          this.vMovement = next / elementSize.scrollAreaHeight * 100
          if (this.onMaxScroll && (maxTop || maxBottom)) {
            this.onMaxScroll({ top: maxTop, bottom: maxBottom, right: false, left: false })
          }
        }
      },
      normalizeHorizontal(next){
        const elementSize = this.getSize()
        // Horizontal Scrolling
        const rightEnd = elementSize.scrollAreaWidth - this.scrollWrapperWidth
        // Max Scroll Right
        const maxRight = next > rightEnd
        if(maxRight) next = rightEnd;
        // Max Scroll Left
        const maxLeft = next < 0
        if(next < 0) next = 0
        // Update the Horizontal Value
        const shouldScroll = this.left !== next
        this.allowBodyScroll = !shouldScroll
        if (shouldScroll) {
          this.left = next;
          this.hMovement = next / elementSize.scrollAreaWidth * 100
          if (this.onMaxScroll && (maxRight || maxLeft)) {
            this.onMaxScroll({ right: maxRight, left: maxLeft, top: false, bottom: false })
          }
        }
      },
      handleChangePosition(movement, orientation){
        // Make sure the content height is not changed
        this.calculateSize(() => {
          // Convert Percentage to Pixel
          const next = movement / 100
          if( orientation === 'vertical' ) this.normalizeVertical( next * this.scrollAreaHeight )
          if( orientation === 'horizontal' ) this.normalizeHorizontal( next * this.scrollAreaWidth )
        })
      },
      handleScrollbarDragging(){
        this.dragging = true
      },
      handleScrollbarStopDrag(){
        this.dragging = false
      },
      getSize(){
        // The Elements
        const $scrollArea = this.$refs.scrollArea
        const $scrollWrapper = this.$refs.scrollWrapper
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
      calculateSize(cb){
        if(typeof cb !== 'function') cb = null;
        const elementSize = this.getSize()
        if( elementSize.scrollWrapperHeight !== this.scrollWrapperHeight ||
            elementSize.scrollWrapperWidth !== this.scrollWrapperWidth ||
            elementSize.scrollAreaHeight !== this.scrollAreaHeight ||
            elementSize.scrollAreaWidth !== this.scrollAreaWidth )
        {
          // Scroll Area Height and Width
          this.scrollAreaHeight = elementSize.scrollAreaHeight;
          this.scrollAreaWidth = elementSize.scrollAreaWidth;
          // Scroll Wrapper Height and Width
          this.scrollWrapperHeight = elementSize.scrollWrapperHeight;
          this.scrollWrapperWidth = elementSize.scrollWrapperWidth;
          // Make sure The wrapper is Ready, then render the scrollbar
          this.ready = true
          return cb ? cb() : false
        }
        else return cb ? cb() : false
      }
    },
    mounted () {
      this.calculateSize()
      // Attach The Event for Responsive View~
      window.addEventListener('resize', this.calculateSize)
    },
    beforeDestroy (){
      // Remove Event
      window.removeEventListener('resize', this.calculateSize)
    }
  }
</script>