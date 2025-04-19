#include "HybridMultiplySpec.hpp"

using margelo::nitro::figwallet_rsmod::HybridMultiplySpec;

class HybridMultiply : public HybridMultiplySpec {
public:
  HybridMultiply() : HybridObject(TAG) {}
  double multiply(double a, double b);
};
