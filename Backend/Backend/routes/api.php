<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Auth\{RegisterController, LoginController, LogoutController, PasswordChangeController, PasswordResetController};
use App\Http\Controllers\User\{AssessmentController, DashboardController, ReportController};
use App\Http\Controllers\Admin\{AdminAuthController, AdminDashboardController, AdminAssessmentController};
use App\Http\Controllers\NotificationController;

// ==========================================
// PUBLIC AUTH ROUTES (بدون حماية)
// ==========================================
Route::prefix('auth')->name('auth.')->group(function () {
    Route::post('register', [RegisterController::class, 'register'])
        ->middleware('throttle:auth')
        ->name('register');

    Route::post('login', [LoginController::class, 'login'])
        ->middleware('throttle:auth')
        ->name('login');

    Route::get('verify-email/{id}/{hash}', [RegisterController::class, 'verifyEmail'])
        ->middleware('signed')
        ->name('verification.verify');

    Route::post('forgot-password', [PasswordResetController::class, 'sendResetLink'])
        ->middleware('throttle:auth');

    Route::post('reset-password', [PasswordResetController::class, 'resetPassword'])
        ->middleware('throttle:auth');
});

// ==========================================
// AUTHENTICATED USER ROUTES (محمية بـ Sanctum)
// ==========================================
Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {

    // Auth management (تمت إضافة /me هنا بطريقة آمنة جداً)
    Route::get('auth/me', function (Request $request) {
        // إرجاع بيانات المستخدم المسجل دخوله
        return response()->json($request->user());
    });
    
    Route::post('auth/logout', [LogoutController::class, 'logout']);
    Route::post('auth/change-password', [PasswordChangeController::class, 'change']);
    Route::post('auth/email/resend', [RegisterController::class, 'resendVerification']);

    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'index']);

    // Assessment
    Route::prefix('assessment')->name('assessment.')->group(function () {
        Route::get('questions', [AssessmentController::class, 'getQuestions']);
        Route::post('start', [AssessmentController::class, 'start']);
        Route::post('{id}/submit', [AssessmentController::class, 'submit']);
        Route::get('{id}/results', [AssessmentController::class, 'results']);
        Route::get('history', [AssessmentController::class, 'history']);
    });

    // Reports
    Route::prefix('report')->group(function () {
        Route::get('{assessment_id}/download', [ReportController::class, 'download']);
        Route::get('{assessment_id}/status', [ReportController::class, 'status']);
    });

    // Notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::post('read-all', [NotificationController::class, 'markAllRead']);
        Route::post('{id}/read', [NotificationController::class, 'markRead']);
    });
});

// ==========================================
// ADMIN ROUTES
// ==========================================
Route::prefix('admin')->name('admin.')->group(function () {
    Route::post('login', [AdminAuthController::class, 'login'])
        ->middleware('throttle:auth');

    Route::middleware(['auth:sanctum', 'is_admin', 'throttle:api'])->group(function () {
        Route::get('dashboard', [AdminDashboardController::class, 'index']);
        Route::get('assessments', [AdminAssessmentController::class, 'index']);
        Route::get('assessments/{id}', [AdminAssessmentController::class, 'show']);
        Route::get('users', [AdminDashboardController::class, 'users']);
        Route::get('analytics/pillars', [AdminDashboardController::class, 'pillarAnalytics']);
    });
});