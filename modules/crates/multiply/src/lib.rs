pub fn multiply(a: f64, b: f64) -> f64 {
    a * b
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let result = multiply(2.0, 2.0);
        assert_eq!(result, 4.0);
    }
}
