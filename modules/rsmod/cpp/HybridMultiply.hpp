#include "HybridMultiplySpec.hpp"

using margelo::nitro::modules::HybridMultiplySpec;

class HybridMultiply : public HybridMultiplySpec {
public:
  HybridMultiply() : HybridObject(TAG) {}
  double multiply(double a, double b);
};
