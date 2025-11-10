import { StyleSheet, Text, View, TextInput, TouchableOpacity, Platform, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signInWithCredential } from 'firebase/auth'
import { auth } from '../../firebase'
import { router } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import * as Google from 'expo-auth-session/providers/google'

WebBrowser.maybeCompleteAuthSession()

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [gLoading, setGLoading] = useState(false)

  // Google Auth setup
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: '792262978726-vodc1sr6e6912qid2jj1f4fr69uvi97b.apps.googleusercontent.com',
    webClientId: '792262978726-vodc1sr6e6912qid2jj1f4fr69uvi97b.apps.googleusercontent.com',
    scopes: ['profile', 'email']
  })

  useEffect(() => {
    const handleGoogleResponse = async () => {
      if (response?.type === 'success') {
        try {
          setGLoading(true)
          const idToken = response.authentication?.idToken
          if (!idToken) throw new Error('Google sign-in failed (missing idToken).')
          const credential = GoogleAuthProvider.credential(idToken)
          await signInWithCredential(auth, credential)
          router.push('/')
        } catch (e) {
          setError(e.message || 'Google sign-in failed')
        } finally {
          setGLoading(false)
        }
      }
    }
    handleGoogleResponse()
  }, [response])

  const validateInputs = () => {
    if (email.trim() === '' || password.trim() === '') {
      setError('Both fields are required')
      return false
    }
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return false
    }
    setError('')
    return true
  }

  const handleLogin = async () => {
    if (!validateInputs()) return
    try {
      setLoading(true)
      await signInWithEmailAndPassword(auth, email, password)
      router.push('/')
    } catch (error) {
      if (error.code === 'auth/invalid-credential') {
        setError('Incorrect email or password')
      } else {
        setError(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    try {
      setGLoading(true)
      if (Platform.OS === 'web') {
        const provider = new GoogleAuthProvider()
        provider.setCustomParameters({ prompt: 'select_account' })
        await signInWithPopup(auth, provider)
        router.push('/')
      } else {
        await promptAsync()
      }
    } catch (e) {
      setError(e.message || 'Google sign-in failed')
    } finally {
      setGLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log In</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'Logging in...' : 'Login'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, styles.googleBtn]}
        onPress={handleGoogleLogin}
        disabled={gLoading || (Platform.OS !== 'web' && !request)}
      >
        {gLoading ? (
          <ActivityIndicator size="small" color="#000" />
        ) : (
          <Text style={[styles.btnText, styles.googleText]}>Continue with Google</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text style={styles.link}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  )
}

export default Login

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 25, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginVertical: 5,
    borderRadius: 8
  },
  btn: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    marginTop: 15
  },
  btnText: { color: 'white', textAlign: 'center', fontWeight: '600' },
  link: { marginTop: 10, textAlign: 'center', color: '#007AFF' },
  error: { color: 'red', marginTop: 10, textAlign: 'center' },
  googleBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd'
  },
  googleText: { color: '#000' }
})
