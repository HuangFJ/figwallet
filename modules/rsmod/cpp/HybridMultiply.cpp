#include "HybridMultiply.hpp"

extern "C" {
double rust_multiply(double a, double b);
};

double HybridMultiply::multiply(double a, double b) { return rust_multiply(a, b); }
