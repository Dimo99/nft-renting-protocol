import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Divider,
  Typography,
} from "@mui/material";

export default function NftCard({
  imageUrl,
  name,
  flashLoanPrice,
  pricePerBlock,
}: {
  imageUrl: string;
  name: string;
  flashLoanPrice: string;
  pricePerBlock: string;
}) {
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardMedia component="img" height="140" image={imageUrl} alt={name} />
      <Divider />
      <CardContent>
        <Typography
          gutterBottom
          variant="h5"
          textAlign="center"
          component="div"
        >
          {name}
        </Typography>
        <Divider />
        <Typography variant="body2" color="text.secondary">
          Flash loan price - {flashLoanPrice}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Price per block - {pricePerBlock}
        </Typography>
      </CardContent>
      <Divider />
      <CardActions sx={{ justifyContent: "space-around" }}>
        <Button size="small">Flash loan</Button>
        <Button size="small">Lend long</Button>
      </CardActions>
    </Card>
  );
}
