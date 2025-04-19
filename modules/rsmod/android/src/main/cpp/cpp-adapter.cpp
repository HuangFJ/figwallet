#include <jni.h>
#include "figwallet_rsmodOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return margelo::nitro::figwallet_rsmod::initialize(vm);
}
