import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

// Define the interface for the component's props
interface WalletProps {
  id: number; // or string, depending on how you use id
  publicKey: string;
  privateKey: string;
  balance? : number;
  handleDelete: () => void; // Function type for the delete handler
  getBalance: () => void;
}

export default function Wallet(props: WalletProps) {
  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        <Typography variant="h5" component="div">
          Wallet {props.id}
        </Typography>
        <Typography variant="body2">
          PUBLIC KEY: {props.publicKey}
        </Typography>
        <Typography variant="body2">
          PRIVATE KEY: {props.privateKey}
        </Typography>

        
         <Typography variant="body2">
          BALANCE: {props.balance}
        </Typography>

        
       
        <br />
        <Stack spacing={2} direction="row">
        <Button variant="outlined" size="small" onClick={props.getBalance}>
          Show Balance
        </Button>
        <Button variant="outlined" size="small" onClick={props.handleDelete}>
          Delete Wallet
        </Button>
        </Stack>
      </CardContent> 
     
    </Card>
  );
}
