package com.kayakcrasher.gnometask;

import android.app.Activity;
import android.app.AlertDialog;
import android.os.Bundle;
import android.graphics.Color;
import android.net.Uri;
import android.view.View;
import android.view.WindowInsets;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Collections;

/** Offline, hardware-accelerated shell. No server or runtime permission prompts required. */
public final class MainActivity extends Activity {
    private static final String HOST = "app.gnometask.local";
    private static final String START = "https://" + HOST + "/index.html";
    private WebView game;

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(54, 89, 76));
        // Target 35 enforces edge-to-edge. Keep controls outside system bars/cutouts.
        root.setOnApplyWindowInsetsListener((v, insets) -> {
            if (android.os.Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets safe = insets.getInsets(
                    WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout() | WindowInsets.Type.ime());
                v.setPadding(safe.left, safe.top, safe.right, safe.bottom);
            } else {
                v.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(),
                    insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            }
            return insets;
        });
        game = new WebView(this);
        game.setBackgroundColor(Color.rgb(245, 235, 214));
        WebSettings settings = game.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setMediaPlaybackRequiresUserGesture(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        game.setWebChromeClient(new WebChromeClient());
        game.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                return !isLocal(req.getUrl());
            }
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
                Uri uri = req.getUrl();
                if (!isLocal(uri)) return missing();
                String path = uri.getPath();
                if (path == null || path.equals("/")) path = "/index.html";
                if (path.contains("..") || path.contains("\\")) return missing();
                String mime = path.endsWith(".js") ? "application/javascript" :
                    path.endsWith(".css") ? "text/css" : path.endsWith(".html") ? "text/html" :
                    path.endsWith(".svg") ? "image/svg+xml" : "application/octet-stream";
                try {
                    return new WebResourceResponse(mime, "UTF-8", 200, "OK",
                        Collections.singletonMap("Cache-Control", "no-cache"),
                        getAssets().open("game" + path));
                } catch (IOException e) { return missing(); }
            }
        });
        root.addView(game, new FrameLayout.LayoutParams(-1, -1));
        setContentView(root);
        root.requestApplyInsets();
        game.loadUrl(START);
    }
    private static boolean isLocal(Uri uri) {
        return "https".equals(uri.getScheme()) && HOST.equals(uri.getHost());
    }
    private static WebResourceResponse missing() {
        return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found",
            Collections.emptyMap(), new ByteArrayInputStream(new byte[0]));
    }
    private void saveGame(Runnable after) {
        // The game binds pagehide to its existing synchronous local save function.
        game.evaluateJavascript("window.dispatchEvent(new Event('pagehide'));", value -> {
            if (after != null) after.run();
        });
    }
    @Override protected void onPause() {
        saveGame(null);
        game.onPause();
        super.onPause();
    }
    @Override protected void onResume() {
        super.onResume();
        if (game != null) game.onResume();
    }
    @Override public void onBackPressed() {
        new AlertDialog.Builder(this).setTitle("Leave Gnometask?")
            .setMessage("Save your progress and close the game?")
            .setNegativeButton("Keep playing", null)
            .setPositiveButton("Save and close", (dialog, which) -> saveGame(this::finish)).show();
    }
    @Override protected void onDestroy() {
        game.destroy();
        super.onDestroy();
    }
}
