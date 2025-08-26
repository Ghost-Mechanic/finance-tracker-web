import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import LoadingOverlay from '../component/LoadingOverlay';

import { useLogin } from './useLogin';

export default function Login() {
  const {
    data,
    showPassword,
    loading,
    error,
    success,
    handleClickShowPassword,
    handleMouseDownPassword,
    handleInputChange,
    handleSubmit,
  } = useLogin();

  const navigate = useNavigate();

  useEffect(() => {
    if (success) {
      navigate('/dashboard');
    }
  }, [success, navigate]);

  return (
    <>
      {loading && <LoadingOverlay />}
    
      <Container component="main" maxWidth="xs"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
        }}
      >
        <Paper elevation={6} sx={{ padding: 4, mt: 8 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography component="h1" variant="h5">
            Log in
            </Typography>
            <Box component="form" data-testid="login-form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={data.email}
                onChange={handleInputChange}
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={data.password}
                onChange={handleInputChange}
                slotProps={{
                  htmlInput: {
                    'data-testid': 'password-input'
                  },
                  input: {
                    endAdornment:
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={
                          showPassword ? 'hide password' : 'show password'
                        }
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                }}
              />
              {error !== '' && <Typography sx={{ color: 'var(--color-text-error)' }} >{error}</Typography>}
              {success && <Typography>test test test</Typography>}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
              Log In
              </Button>
            </Box>
            <Link href='/register' variant='body2'>
            Register
            </Link>
          </Box>
        </Paper>
      </Container>
    </>
  );
}
