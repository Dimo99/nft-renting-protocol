import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Divider,
  Typography,
} from "@mui/material";

export default function NftCardOwner({
  address,
  id,
  imageUrl,
  name,
  flashLoanPrice,
  pricePerBlock,
  onEdit,
  onRemove,
}: {
  address: string;
  id: string;
  imageUrl: string;
  name: string;
  flashLoanPrice: string;
  pricePerBlock: string;
  onEdit: (address: string, id: string) => void;
  onRemove: (address: string, id: string) => void;
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
        <Button size="small" onClick={() => onEdit(address, id)}>
          Edit
        </Button>
        <Button size="small" onClick={() => onRemove(address, id)}>
          Remove
        </Button>
      </CardActions>
    </Card>
  );
}
