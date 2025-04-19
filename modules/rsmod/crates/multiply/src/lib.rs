#[unsafe(no_mangle)]
pub extern "C" fn rust_multiply(a: f64, b: f64) -> f64 {
    a * b
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let result = rust_multiply(2.0, 2.0);
        assert_eq!(result, 4.0);
    }
}
