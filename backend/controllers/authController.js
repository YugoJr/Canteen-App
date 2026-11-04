export function register(req, res) {
  res.status(200).json({ received: req.body });
}