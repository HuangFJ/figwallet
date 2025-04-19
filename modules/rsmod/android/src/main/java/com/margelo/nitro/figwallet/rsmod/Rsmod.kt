package com.margelo.nitro.figwallet.rsmod
  
import com.facebook.proguard.annotations.DoNotStrip

@DoNotStrip
class Rsmod : HybridRsmodSpec() {
  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }
}
