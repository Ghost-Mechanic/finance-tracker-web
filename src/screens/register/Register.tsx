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

import { useRegister } from './useRegister';

export default function Register() {
  const {
    data,
    showPassword,
    showConfirmPassword,
    loading,
    error,
    success,
    handleClickShowPassword,
    handleClickShowConfirmPassword,
    handleMouseDownPassword,
    handleMouseDownConfirmPassword,
    handleInputChange,
    handleSubmit,
  } = useRegister();

  const navigate = useNavigate();

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate('/login');
      }, 1500); // Redirect after 1.5 seconds

      return () => clearTimeout(timer); // Cleanup the timer
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
            Register
            </Typography>
            <Box component="form" data-testid="register-form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                name="username"
                label="Username"
                type="text"
                id="username"
                autoComplete="username"
                value={data.username}
                onChange={handleInputChange}
              />
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
                autoComplete="new-password"
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
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirm-password"
                autoComplete="new-password"
                value={data.confirmPassword}
                onChange={handleInputChange}
                slotProps={{
                  htmlInput: {
                    'data-testid': 'confirm-password-input'
                  },
                  input: {
                    endAdornment:
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={
                          showConfirmPassword ? 'hide confirm password' : 'show confirm password'
                        }
                        onClick={handleClickShowConfirmPassword}
                        onMouseDown={handleMouseDownConfirmPassword}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                }}
              />
              {error !== '' && <Typography sx={{ color: 'var(--color-text-error)' }} >{error}</Typography>}
              {success && <Typography sx={{ color: 'green', mt: 2, textAlign: 'center' }}>Registration successful! Redirecting to login...</Typography>}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={success}
              >
              Register
              </Button>
            </Box>
            {!success && <Link href='/login' variant='body2'>
              Login
            </Link>}
          </Box>
        </Paper>
      </Container>
    </>
  );
}
