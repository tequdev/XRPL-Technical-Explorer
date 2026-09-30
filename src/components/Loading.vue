<template>
  <div>
    <div class="card shadow mt-3 mb-1">
      <div class="card-body pb-5 bg-light">
        <div class="text-center blue nes mt-3">
          <div class="fa-3x">
            <i class="fas fa-circle-notch fa-spin"></i>
          </div>
          <div class="mt-3">Yo, {{ $net.xrpl || $net.xrpl_test ? 'XRP Ledger' : $net.xahau || $net.xahau_test || $net.xahau_dev ? 'Xahau' : $net.local ? 'Local Network' : $net.custom ? 'Custom Network' : 'Unknown Network' }}!?</div>
          <div class="mt-2 pre">Loading...</div>
        </div>
      </div>
    </div>
    <br />
  </div>
</template>

<script>
export default {
  name: 'Loading'
}
</script>

<style lang="scss" scoped>
</style>
